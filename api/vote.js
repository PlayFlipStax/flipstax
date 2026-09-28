// POST /api/vote
// Body: { itemId: "kendrick" }  (any stable string id for the thing being voted for)
//
// Increments a global counter in Upstash Redis for that item and returns
// the new raw count. This is the ONLY place a vote is ever written —
// the client never trusts its own local tally as the source of truth.
//
// Env vars required (auto-set by the Vercel Upstash integration):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Light rate limiting to blunt trivial spam. Not bulletproof (no auth on
// this endpoint). It used to be one vote per 2 seconds per IP, which
// silently dropped real votes: a quick player taps faster than that, and
// many players can share one IP (mobile carriers, schools, offices). Now
// it's two fixed-window counters:
//   - per play session (a random id the page makes on each load and keeps
//     in memory only - see castVote in flipstax.html): generous for any
//     human pace, stops a single tab from hammering the counter;
//   - per IP: a much higher ceiling, so a shared IP still has room for
//     lots of players at once, but a script rotating fake session ids
//     can't go unbounded.
// Requests from an older cached page (no session id) share their IP's
// "no session" bucket at the per-session limit.
const SESSION_WINDOW_SECONDS = 10;
const SESSION_MAX_VOTES = 12;      // more than one a second, sustained
const IP_WINDOW_SECONDS = 60;
const IP_MAX_VOTES = 300;
const SESSION_ID_RE = /^[a-z0-9]{12,40}$/;

// Real itemIds only ever come from the client's slugify() (lowercase,
// alphanumeric segments joined by single hyphens, "item" as the empty
// fallback). Longest real slug in the current deck is 65 chars. This
// rejects anything shaped differently - raw unicode, emoji, oversized
// strings, or other junk sent straight to the API - before it ever
// reaches Redis.
const ITEM_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ITEM_ID_MAX_LENGTH = 80;

function getClientIp(req) {
  // Vercel's edge appends the connecting client's IP as the LAST entry
  // of X-Forwarded-For; anything before that is whatever the client
  // itself (or an earlier hop) chose to send, and is trivially spoofable.
  // Reading [0] instead of the last entry would let a client defeat the
  // rate limit just by sending its own made-up XFF header.
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;
    const itemId = body && typeof body === 'object' ? body.itemId : undefined;

    if (
      typeof itemId !== 'string' ||
      itemId.length === 0 ||
      itemId.length > ITEM_ID_MAX_LENGTH ||
      !ITEM_ID_RE.test(itemId)
    ) {
      return res.status(400).json({ error: 'itemId must be a slug-shaped string' });
    }

    const ip = getClientIp(req);
    const sid = body && typeof body.sid === 'string' && SESSION_ID_RE.test(body.sid) ? body.sid : 'nosid';
    const now = Math.floor(Date.now() / 1000);
    // The window number is part of each key, so every key simply expires
    // on its own shortly after its window ends.
    const sessionKey = `ratelimit:vote:s:${ip}:${sid}:${Math.floor(now / SESSION_WINDOW_SECONDS)}`;
    const ipKey = `ratelimit:vote:ip:${ip}:${Math.floor(now / IP_WINDOW_SECONDS)}`;
    const [sessionCount, , ipCount] = await redis.multi()
      .incr(sessionKey).expire(sessionKey, SESSION_WINDOW_SECONDS * 2)
      .incr(ipKey).expire(ipKey, IP_WINDOW_SECONDS * 2)
      .exec();

    if (sessionCount > SESSION_MAX_VOTES || ipCount > IP_MAX_VOTES) {
      return res.status(429).json({ error: 'Too many votes, slow down' });
    }

    const newCount = await redis.incr(`votes:${itemId}`);
    return res.status(200).json({ itemId, count: newCount });
  } catch (err) {
    console.error('vote.js error:', err);
    return res.status(500).json({ error: 'Internal error recording vote' });
  }
}
