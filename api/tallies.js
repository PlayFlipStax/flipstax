// GET /api/tallies?ids=kendrick,drake
//
// Returns current vote counts + percentages for a comma-separated list of
// item ids. Used to render the live "X% vs Y%" display, and safe to poll
// repeatedly (read-only, cheap Redis MGET).
//
// Response shape:
// {
//   "counts": { "kendrick": 10831, "drake": 15679 },
//   "percentages": { "kendrick": 40.86, "drake": 59.14 },
//   "total": 26510
// }

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Same shape constraint as vote.js - real ids only ever come from the
// client's slugify() output. Anything else is dropped rather than sent
// to Redis, so a crafted ids= list can't be used to read or create
// arbitrary keys.
const ITEM_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ITEM_ID_MAX_LENGTH = 80;

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const idsParam = req.query.ids;

    if (!idsParam || typeof idsParam !== 'string') {
      return res.status(400).json({ error: 'ids query param is required, e.g. ?ids=kendrick,drake' });
    }

    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= ITEM_ID_MAX_LENGTH && ITEM_ID_RE.test(s))
      .slice(0, 20); // sanity cap

    if (ids.length === 0) {
      return res.status(400).json({ error: 'No valid ids provided' });
    }

    const keys = ids.map((id) => `votes:${id}`);
    const rawCounts = await redis.mget(...keys);

    const counts = {};
    let total = 0;
    ids.forEach((id, i) => {
      const c = Number(rawCounts[i]) || 0;
      counts[id] = c;
      total += c;
    });

    const percentages = {};
    ids.forEach((id) => {
      percentages[id] = total > 0 ? Number(((counts[id] / total) * 100).toFixed(2)) : 0;
    });

    // Cache briefly at the edge to reduce read load under heavy polling.
    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=5');

    return res.status(200).json({ counts, percentages, total });
  } catch (err) {
    console.error('tallies.js error:', err);
    return res.status(500).json({ error: 'Internal error fetching tallies' });
  }
}
