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

// Very light rate limiting per IP to blunt trivial spam-refresh abuse.
// Not bulletproof (no auth on this endpoint), but stops a single browser
// from hammering the counter in a tight loop.
const RATE_LIMIT_WINDOW_SECONDS = 2;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemId } = req.body || {};

  if (!itemId || typeof itemId !== 'string' || itemId.length > 100) {
    return res.status(400).json({ error: 'itemId (string) is required' });
  }

  // Basic per-IP throttle: one vote per RATE_LIMIT_WINDOW_SECONDS.
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const rateKey = `ratelimit:vote:${ip}`;

  try {
    const alreadyVoted = await redis.set(rateKey, '1', {
      nx: true,
      ex: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (alreadyVoted === null) {
      // Key already existed — this IP voted too recently.
      return res.status(429).json({ error: 'Too many votes, slow down' });
    }

    const newCount = await redis.incr(`votes:${itemId}`);
    return res.status(200).json({ itemId, count: newCount });
  } catch (err) {
    console.error('vote.js error:', err);
    return res.status(500).json({ error: 'Internal error recording vote' });
  }
}
