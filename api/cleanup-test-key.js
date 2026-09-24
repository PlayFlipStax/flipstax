// TEMPORARY one-off: deletes a single leftover test key, then gets removed.
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEY = 'votes:security-hardening-live-check';

export default async function handler(req, res) {
  try {
    const before = await redis.get(KEY);
    const deleted = await redis.del(KEY);
    const after = await redis.get(KEY);
    return res.status(200).json({ key: KEY, before, deleted, after });
  } catch (err) {
    console.error('cleanup error:', err);
    return res.status(500).json({ error: 'cleanup failed' });
  }
}
