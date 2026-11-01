/**
 * The ~13 "typography picker" families (Playfair Display, Merriweather, Cormorant,
 * …) are only ever rendered on blog posts, the About page, and inside the CMS
 * editor - never on the homepage or the rest of the marketing site.
 *
 * Loading them from a <link> in index.html made every visitor pay for an extra
 * Google Fonts request (and a preconnect slot) they almost never needed. Instead
 * the routes that actually use these families call `ensureEditorFonts()` on mount,
 * which injects the stylesheet once, lazily.
 */
const EDITOR_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&family=Source+Serif+4:wght@400;500;600&family=Merriweather:wght@400;700&family=Nunito:wght@400;600&family=Roboto+Serif:wght@400;500;600&family=Libre+Baskerville:wght@400;700&family=Cormorant+Garamond:wght@400;500;600&family=Bai+Jamjuree:wght@400;600&family=IBM+Plex+Sans:wght@400;600&family=Libre+Franklin:wght@400;600&display=swap';

let injected = false;

export function ensureEditorFonts(): void {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById('editor-fonts')) {
    injected = true;
    return;
  }
  injected = true;
  const link = document.createElement('link');
  link.id = 'editor-fonts';
  link.rel = 'stylesheet';
  link.href = EDITOR_FONTS_HREF;
  document.head.appendChild(link);
}
