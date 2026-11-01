/**
 * Cache-Control for public API reads.
 *
 * The frontend is a static SPA that talks to this API directly from the browser, and the
 * API runs on a single origin VPS with no CDN of its own. Letting a shared cache / CDN
 * (Cloudflare) answer repeat reads for anonymous visitors removes most of the per-request
 * latency for content that changes rarely (trips, categories, regions, pages, ...).
 *
 * Heuristic: a request with no `Authorization` header is an anonymous content read and is
 * safe to cache. Anything with a bearer token is per-user (CMS, bookings, auth) and must
 * never be stored by an intermediary.
 *
 * Freshness strategy — no active purging (the Cloudflare zone is shared with other
 * subdomains, so `purge_everything` is off the table and per-URL purge can't cover
 * query-string variants). Instead:
 *   - s-maxage keeps the edge copy "fresh" for a couple of minutes
 *   - a long stale-while-revalidate means that after that, the edge serves the STALE copy
 *     instantly and refreshes in the background — the visitor never waits on the origin
 *   - stale-if-error keeps the site up if the origin blips
 * Worst-case staleness for anonymous visitors is ~s-maxage. Logged-in CMS users always get
 * `no-store`, so editors see their changes immediately.
 */

const CACHEABLE_METHODS = new Set(['GET', 'HEAD']);

// Per-user or sensitive even when no token is presented.
const NEVER_CACHE = [/^\/v1\/auth\b/, /^\/v1\/bookings\b/, /^\/v1\/admin\b/, /^\/v1\/media\b/];

// Slow-changing reference data can sit at the edge much longer than trip content.
const LONG_LIVED = [
  /^\/v1\/categories\b/,
  /^\/v1\/subcategories\b/,
  /^\/v1\/regions\b/,
  /^\/v1\/countries\b/,
  /^\/v1\/navigation\b/,
  /^\/v1\/faqs\b/,
  /^\/v1\/team\b/,
  /^\/v1\/guides\b/,
];

const WEEK = 604800;

export const publicCacheControl = (req, res, next) => {
  const path = req.path || req.originalUrl || '';
  const isAnon = !req.headers.authorization;
  const cacheable =
    CACHEABLE_METHODS.has(req.method) && isAnon && !NEVER_CACHE.some((re) => re.test(path));

  if (!cacheable) {
    res.set('Cache-Control', 'no-store');
    res.locals.publicCacheable = false;
    return next();
  }

  res.locals.publicCacheable = true;
  const sMaxAge = LONG_LIVED.some((re) => re.test(path)) ? 3600 : 120;

  res.set(
    'Cache-Control',
    `public, max-age=60, s-maxage=${sMaxAge}, stale-while-revalidate=${WEEK}, stale-if-error=${WEEK}`
  );
  res.set('Vary', 'Origin, Accept-Encoding');

  next();
};

export default publicCacheControl;
