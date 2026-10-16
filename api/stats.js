// GET /api/stats?env=production|preview   (header: x-stats-key: <STATS_KEY>)
// Today and the last 7 days of the anonymous counters written by /api/event. Not public: without the STATS_KEY env var
// set it answers 503, with a wrong key 401. The /stats page (stats.html) asks for the key and sends it in the header.

import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'node:crypto';

const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

function sameKey(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
    const want = process.env.STATS_KEY;
    if (!want) return res.status(503).json({ error: 'STATS_KEY is not set' });
    const got = req.headers['x-stats-key'];
    if (typeof got !== 'string' || !sameKey(got, want)) return res.status(401).json({ error: 'Wrong key' });
    const env = req.query && req.query.env === 'preview' ? 'preview' : 'production';
    const days = [];
    for (let i = 0; i < 8; i++) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    const p = redis.pipeline();
    days.forEach((d) => p.hgetall(`stats:${env}:${d}`));
    const rows = await p.exec();
    return res.status(200).json({ env, days: days.map((d, i) => ({ date: d, counts: rows[i] || {} })) });
  } catch (err) {
    console.error('stats.js error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
