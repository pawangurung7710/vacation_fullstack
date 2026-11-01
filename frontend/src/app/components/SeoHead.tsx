import { useEffect, useRef } from 'react';
import { getBaseUrl, DEFAULT_SEO, SITE_NAME } from '../config/seo';

export type SeoHeadProps = {
  title?: string;
  description?: string;
  /** Absolute or relative image URL for OG/Twitter. */
  image?: string;
  /** Full URL for canonical and og:url. */
  canonicalUrl?: string;
  /** If true, add robots noindex,nofollow. */
  noindex?: boolean;
  /** JSON-LD script content (object or string). */
  jsonLd?: Record<string, unknown> | string;
  /** og:type and twitter:card. */
  type?: 'website' | 'article';
};

function setMeta(name: string, value: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  if (el.getAttribute('content') !== value) {
    el.setAttribute('content', value);
  }
}

function removeMeta(name: string, attribute: 'name' | 'property' = 'name') {
  const el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (el) el.remove();
}

export function SeoHead({
  title,
  description,
  image,
  canonicalUrl,
  noindex,
  jsonLd,
  type = 'website',
}: SeoHeadProps) {
  const jsonLdIdRef = useRef<string | null>(null);

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const fullTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : DEFAULT_SEO.title;
    const fullDescription = description ?? DEFAULT_SEO.description;
    const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`) : undefined;
    const url = canonicalUrl || (baseUrl ? `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''}` : undefined);

    document.title = fullTitle;

    setMeta('description', fullDescription);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', fullDescription, 'property');
    setMeta('og:type', type, 'property');
    if (url) setMeta('og:url', url, 'property');
    if (fullImage) setMeta('og:image', fullImage, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    setMeta('twitter:card', fullImage ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', fullDescription);
    if (fullImage) setMeta('twitter:image', fullImage);

    if (url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = url;
    }

    if (noindex) {
      setMeta('robots', 'noindex,nofollow');
    } else {
      removeMeta('robots');
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd);
      const id = 'seo-jsonld-' + Math.random().toString(36).slice(2, 9);
      script.id = id;
      jsonLdIdRef.current = id;
      document.head.appendChild(script);
    }

    return () => {
      if (jsonLdIdRef.current) {
        const script = document.getElementById(jsonLdIdRef.current);
        if (script) script.remove();
        jsonLdIdRef.current = null;
      }
    };
  }, [title, description, image, canonicalUrl, noindex, jsonLd, type]);

  return null;
}
