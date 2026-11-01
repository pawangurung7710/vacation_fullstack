/**
 * SEO defaults per route. Used when a page doesn't set its own meta.
 * Paths are matched in order; first match wins. Use '*' for catch-all segments.
 */
const SITE_NAME = 'The Trekkers Squad';
const DEFAULT_DESCRIPTION =
  'Small-group treks, expeditions and outdoor adventures led by local guides in over 40 countries.';

export type SeoEntry = {
  title: string;
  description: string;
  /** Optional OG/Twitter image URL (absolute). */
  image?: string;
  /** e.g. "article" for blog, "website" for home. */
  type?: 'website' | 'article';
};

/** Base URL for canonical and OG URLs. Set at build/runtime if needed. */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/** Route → SEO defaults (exact path or pattern). */
const ROUTE_SEO: Array<{ pattern: RegExp | string; seo: SeoEntry }> = [
  { pattern: '/', seo: { title: `${SITE_NAME} | Small-Group Adventures Worldwide`, description: DEFAULT_DESCRIPTION, type: 'website' } },
  { pattern: '/all-trips', seo: { title: `All Trips | ${SITE_NAME}`, description: 'Browse all mountain adventures: treks, expeditions, rides and retreats with local guides.' } },
  { pattern: '/calendar', seo: { title: `Trip Calendar | ${SITE_NAME}`, description: 'See departure dates for our trips. Plan your next mountain adventure.' } },
  { pattern: '/about', seo: { title: `About Us | ${SITE_NAME}`, description: 'Learn about The Trekkers Squad: our story, our team and how we run small-group trips.' } },
  { pattern: '/about/story', seo: { title: `Our Story | ${SITE_NAME}`, description: 'How Trekkers Squad started and our philosophy of transformative, responsible travel.' } },
  { pattern: '/about/team', seo: { title: `Our Team | ${SITE_NAME}`, description: 'Meet the people behind Trekkers Squad and our local guides.' } },
  { pattern: '/about/careers-partnerships', seo: { title: `Careers & Partnerships | ${SITE_NAME}`, description: 'Join The Trekkers Squad or partner with us. Careers in adventure travel, open positions, and partnership opportunities for responsible travel in the mountains.' } },
  { pattern: '/trip-comparison', seo: { title: `Compare Trips | ${SITE_NAME}`, description: 'Compare our trips and find the right one for you.' } },
  { pattern: '/contact', seo: { title: `Contact | ${SITE_NAME}`, description: 'Get in touch with the Trekkers Squad team.' } },
  { pattern: '/blog', seo: { title: `Blog | ${SITE_NAME}`, description: 'Guides, gear and field notes from the trail.', type: 'website' } },
  { pattern: '/faq', seo: { title: `FAQ | ${SITE_NAME}`, description: 'Frequently asked questions about The Trekkers Squad trips, booking, safety, gear and travel logistics. Find answers before you travel.' } },
  { pattern: '/reviews', seo: { title: `Reviews | ${SITE_NAME}`, description: 'What travelers say about their Trekkers Squad experiences.' } },
  // Dynamic routes use generic titles; pages can override with SeoHead.
  { pattern: /^\/trip\/[^/]+$/, seo: { title: `Trip | ${SITE_NAME}`, description: 'Small-group adventure with The Trekkers Squad.' } },
  { pattern: /^\/blog\/[^/]+$/, seo: { title: `Story | ${SITE_NAME}`, description: 'Stories from the Trail.', type: 'article' } },
  { pattern: /^\/trips\/.+/, seo: { title: `Trips | ${SITE_NAME}`, description: 'mountain adventures in this category.' } },
];

export function getSeoForPath(pathname: string): SeoEntry | null {
  for (const { pattern, seo } of ROUTE_SEO) {
    if (typeof pattern === 'string') {
      if (pathname === pattern) return seo;
    } else if (pattern.test(pathname)) {
      return seo;
    }
  }
  return null;
}

export const DEFAULT_SEO: SeoEntry = {
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  type: 'website',
};

export { SITE_NAME, DEFAULT_DESCRIPTION };
