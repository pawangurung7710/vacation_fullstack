/**
 * Tiny in-process response cache for anonymous GET reads.
 *
 * Even with Cloudflare in front, the origin still gets hit on every edge revalidation
 * (stale-while-revalidate fires a background fetch) and from every cold PoP. Those all run
 * the Mongo query + response shaping. A few seconds of in-RAM caching collapses that to a
 * buffer copy, so a burst of revalidations across PoPs costs one DB query, not dozens.
 *
 * Keyed by method + full URL. Only anonymous requests are cached (the handler that sets
 * Cache-Control has already decided that via `res.locals.publicCacheable`). Any write to
 * the DB bumps a global epoch, instantly invalidating everything.
 */
import { LRUCache } from 'lru-cache';

const TTL_MS = Number(process.env.RESPONSE_CACHE_TTL_MS || 15_000);

const cache = new LRUCache({
  max: 500,
  ttl: TTL_MS,
  allowStale: false,
});

let epoch = 0;

/** Call after any mutation so the next read re-hits the DB. */
export const bustResponseCache = () => {
  epoch += 1;
  cache.clear();
};

export const responseCache = (req, res, next) => {
  // Any successful write invalidates the cache — cheap and always correct.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) bustResponseCache();
    });
    return next();
  }

  if (!res.locals.publicCacheable) {
    return next();
  }

  const key = `${epoch}:${req.method}:${req.originalUrl}`;
  const hit = cache.get(key);
  if (hit) {
    res.set(hit.headers);
    res.set('X-Cache', 'HIT');
    return res.status(hit.status).json(hit.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, {
        status: res.statusCode,
        body,
        headers: {
          'Cache-Control': res.get('Cache-Control'),
          Vary: res.get('Vary'),
        },
      });
    }
    res.set('X-Cache', 'MISS');
    return originalJson(body);
  };

  next();
};

export default responseCache;
