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
    const rateKey = `ratelimit:vote:${ip}`;

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
