const PERMALINK_PATTERN = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;

/**
 * Extract a clean, canonical Instagram post permalink from arbitrary input.
 * Accepts either a bare permalink URL or a full pasted <blockquote> embed
 * snippet (which contains the same URL buried inside its markup).
 * Returns null if no permalink pattern is found.
 */
export const extractInstagramPermalink = (input) => {
  if (typeof input !== 'string') return null;
  const match = input.match(PERMALINK_PATTERN);
  if (!match) return null;
  const [, type, id] = match;
  return `https://www.instagram.com/${type}/${id}/`;
};
