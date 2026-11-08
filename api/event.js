// POST /api/event
// Body: { e: { "show_started": 1, "game_started:snapSort": 1, ... } }  (event name -> how many)
//
// Anonymous daily counters only: one Redis hash per day and environment (stats:<env>:<YYYY-MM-DD>), one field per
// event name, bumped with HINCRBY. Nothing identifies a player: no IP, no session id, no cookie, no user agent is
// read or stored. The names are checked against a fixed list, so the hash can't be filled with junk. One request is
// at most MAX_FIELDS HINCRBYs plus one EXPIRE (the client sends 3 or 4 small batches an episode, well under 20
// Redis commands per player per episode).
//
// Env vars: KV_REST_API_URL, KV_REST_API_TOKEN (the same Upstash integration as /api/vote).

import { Redis } from '@upstash/redis';

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

const PLAIN = new Set(['show_started', 'reached_results', 'share_clicked']);
// The games that can be counted (game_started:<name> and game_completed:<name>).
const GAMES = new Set(['riddle', 'crowdScan', 'emojiDecode', 'timeWarp', 'peakOrPlunge', 'snapSort', 'zapWords',
  'twinFlip', 'factOrFib', 'saucerShuffle', 'priceProbe', 'oddballAlert', 'luckyLights', 'cosmicSurprise', 'door', 'orbitDrop']);   // (Run 4A: the Mystery Door and Round 6's Orbit Drop)
const MAX_FIELDS = 8;
const KEEP_SECONDS = 40 * 24 * 3600;

function validEvent(name) {
  if (PLAIN.has(name)) return true;
  const m = /^(game_started|game_completed):([A-Za-z]{2,20})$/.exec(name);
  return !!m && GAMES.has(m[2]);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const e = req.body && typeof req.body === 'object' ? req.body.e : null;
    if (!e || typeof e !== 'object' || Array.isArray(e)) return res.status(400).json({ error: 'e must be an object' });
    const names = Object.keys(e).filter((n) => validEvent(n) && Number.isInteger(e[n]) && e[n] > 0 && e[n] <= 5).slice(0, MAX_FIELDS);
    if (!names.length) return res.status(400).json({ error: 'no valid events' });
    const env = process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
    const key = `stats:${env}:${new Date().toISOString().slice(0, 10)}`; // (UTC day)
    const p = redis.pipeline();
    names.forEach((n) => p.hincrby(key, n, e[n]));
    p.expire(key, KEEP_SECONDS);
    await p.exec();
    return res.status(204).end();
  } catch (err) {
    console.error('event.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
