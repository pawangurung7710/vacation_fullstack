import { useEffect, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Breadcrumbs } from '../components/breadcrumbs';
import { ScrollAnimate } from '../components/scroll-animate';
import { useBlogPost } from '../hooks/useBlog';
import { getFontStack } from '../constants/blogFonts';
import { ensureEditorFonts } from '../utils/editor-fonts';
import { SeoHead } from '../components/SeoHead';
import { SITE_NAME } from '../config/seo';

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = useBlogPost(slug || '');

  // Posts can pick any of the typography-picker families - pull them in now.
  useEffect(() => { ensureEditorFonts(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative h-[50vh] min-h-[420px] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900" />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <Skeleton className="h-6 w-32 mb-6 bg-white/20" />
              <Skeleton className="h-14 w-3/4 mb-4 bg-white/20" />
              <Skeleton className="h-6 w-2/3 bg-white/20" />
            </div>
          </div>
        </section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Blog post not found</h2>
            <p className="text-gray-600">We couldn’t find the story you’re looking for.</p>
            <Link to="/blog">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayDate = post.date
    ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined;

  const heroImage = post.image || post.featuredImage;
  const fontStack = getFontStack(post.fontFamily);
  const postFontStyle = {
    fontFamily: fontStack,
    '--story-font-stack': fontStack,
  } as CSSProperties & { '--story-font-stack': string };
  const tags = (post.tags || []).filter((tag: string, index: number, list: string[]) => {
    const key = tag.trim().toLowerCase();
    if (!key) return false;
    return list.findIndex((item) => item.trim().toLowerCase() === key) === index;
  });

  const postDescription = post.excerpt || (post.content ? String(post.content).replace(/<[^>]+>/g, '').slice(0, 160) : '') || 'Stories from the Trail.';
  const postUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const datePublished = post.date || post.publishedAt;
  const dateModified = (post as { updatedAt?: string }).updatedAt || datePublished;

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoHead
        title={post.title}
        description={postDescription}
        image={heroImage}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: postDescription,
          image: heroImage,
          url: postUrl,
          mainEntityOfPage: postUrl ? { '@type': 'WebPage', '@id': postUrl } : undefined,
          datePublished: datePublished || undefined,
          dateModified: dateModified || undefined,
          author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
        }}
      />
      <section className="relative h-[60vh] min-h-[520px] overflow-hidden bg-gray-900">
        {heroImage && (
          <div className="absolute inset-0">
            <img src={heroImage} alt={post.title} className="w-full h-full object-cover animate-hero-zoom" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest-900)]/85 to-[var(--color-navy-900)]/75" />
          </div>
        )}

        <div className="relative z-10 h-full flex items-center story-font-stack" style={postFontStyle}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumbs
              items={[
                { label: 'Blog', href: '/blog' },
                { label: post.title },
              ]}
              className="mb-8 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            />
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {post.category && (
                  <Badge className="bg-white/20 text-white border border-white/30">
                    {post.category}
                  </Badge>
                )}
                {tags.map((tag: string) => (
                  <Badge
                    key={`${post.slug || post._id}-${tag}`}
                    className={
                      tag.toLowerCase() === 'default'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white/15 text-white border border-white/30'
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 text-white glass-text-contrast-heavy animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-white/90 leading-relaxed animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 story-font-stack" style={postFontStyle}>
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[var(--color-navy-600)] hover:underline">
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          {displayDate && (
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{displayDate}</span>
            </div>
          )}
          {post.readTime && (
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{post.readTime}</span>
            </div>
          )}
          {post.authorName && <span>By {post.authorName}</span>}
        </div>

        <div
          className="prose prose-lg max-w-none text-gray-700 story-font-stack"
          style={postFontStyle}
          dangerouslySetInnerHTML={{
            __html: post.content || '',
          }}
        />
      </article>
    </div>
  );
}
