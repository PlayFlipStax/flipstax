// POST /api/_cleanup_test_keys
// One-off: deletes the two leftover test vote keys from development
// testing (votes:test-item-a, votes:test-item-b). Only ever touches those
// two fixed keys - no arbitrary key parameter - and is meant to be removed
// again right after use, not left as a standing admin endpoint.

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const deletedA = await redis.del('votes:test-item-a');
    const deletedB = await redis.del('votes:test-item-b');
    return res.status(200).json({
      deleted: { 'votes:test-item-a': deletedA, 'votes:test-item-b': deletedB },
    });
  } catch (err) {
    console.error('_cleanup_test_keys error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
