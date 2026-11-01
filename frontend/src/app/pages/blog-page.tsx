import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { useBlogPosts, type BlogPost } from '../hooks/useBlog';
import { resolveMediaUrl, mediaSrcSet } from '../services/api';
import { NewsletterSubscribeForm } from '../components/newsletter-subscribe-form';
import { SeoHead } from '../components/SeoHead';
import { SITE_NAME } from '../config/seo';

const POSTS_PER_PAGE = 10;

const CATEGORIES = [
  { id: 'all', label: 'All Stories' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'gear', label: 'Gear & Kit' },
  { id: 'training', label: 'Training' },
  { id: 'stories', label: 'Trail Stories' },
  { id: 'safety', label: 'Safety' },
  { id: 'guides', label: 'Guide Notes' },
];

const CATEGORY_COLORS: Record<string, string> = {
  destinations: 'text-sky-700',
  gear: 'text-slate-700',
  training: 'text-emerald-700',
  stories: 'text-purple-700',
  safety: 'text-red-700',
  guides: 'text-green-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  destinations: 'Destinations',
  gear: 'Gear & Kit',
  training: 'Training',
  stories: 'Trail Stories',
  safety: 'Safety',
  guides: 'Guide Notes',
};

function getAuthorName(post: BlogPost) {
  if (post.authorName) return post.authorName;
  if (typeof post.author === 'string') return post.author;
  return post.author?.name || post.author?.email || 'Trekkers Squad Team';
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'N';
}

function formatDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ArticleCard({ post }: { post: BlogPost }) {
  const authorName = getAuthorName(post);
  const categoryLabel = CATEGORY_LABELS[post.category] ?? post.category;
  const categoryColor = CATEGORY_COLORS[post.category] ?? 'text-gray-500';

  return (
    <Link to={`/blog/${post.slug || post._id}`} className="group block">
      {/* Image */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100 mb-4" style={{ aspectRatio: '4/3' }}>
        {(() => {
          const raw = post.image || post.featuredImage || '';
          if (!raw) return null;
          return (
            <img
              src={resolveMediaUrl(raw, { width: 700, ar: '4:3', crop: 'c_fill' })}
              srcSet={mediaSrcSet(raw, [360, 540, 800], { ar: '4:3', crop: 'c_fill' })}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          );
        })()}
      </div>

      {/* Meta */}
      <div className="space-y-2">
        <p className={`text-xs font-semibold uppercase tracking-widest ${categoryColor}`}>
          {categoryLabel}
        </p>
        <h3 className="text-[#121212] font-bold text-lg leading-snug group-hover:text-[var(--color-forest-600)] transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Author row */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(authorName)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <span className="font-medium text-gray-600">{authorName}</span>
            {post.date && (
              <>
                <span>·</span>
                <span>{formatDate(post.date)}</span>
              </>
            )}
            {post.readTime && (
              <>
                <span>·</span>
                <Clock size={11} />
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-xl bg-gray-100 mb-4" style={{ aspectRatio: '4/3' }} />
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-100 rounded" />
        <div className="h-5 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [catBarPinned, setCatBarPinned] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { posts: blogPosts, pagination, loading } = useBlogPosts({
    category: activeCategory !== 'all' ? activeCategory : undefined,
    page,
    limit: POSTS_PER_PAGE,
  });

  const totalPages = pagination?.pages || 1;
  const blogOgImage = 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1600&q=80';

  // Pin the category bar when hero scrolls past
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      setCatBarPinned(heroRef.current.getBoundingClientRect().bottom < 64);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      <SeoHead
        title={`Blog | ${SITE_NAME}`}
        description="Guides, gear and field notes from the trail. Read destination guides, gear advice and training tips."
        image={blogOgImage}
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `Blog | ${SITE_NAME}`,
          description: 'Guides, gear and field notes from the trail.',
          url: typeof window !== 'undefined' ? `${window.location.origin}/blog` : undefined,
          image: blogOgImage,
          publisher: { '@type': 'Organization', name: SITE_NAME },
        }}
      />

      {/* ── Masthead ── */}
      <div ref={heroRef} className="bg-white pt-10 pb-0">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Top rule with brand mark */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gray-300" />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--color-forest-600)]">
                <path d="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="currentColor" />
              </svg>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--color-forest-600)]">
                The Trekkers Squad
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Display title */}
          <h1
            className="font-black text-[#121212] uppercase leading-none tracking-tight"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Stories from<br className="sm:hidden" /> the mountains
          </h1>

          {/* Bottom rule */}
          <div className="h-px bg-gray-300 mt-6" />
        </div>
      </div>

      {/* ── Floating Category Bar ── */}
      <div
        className="z-30 bg-white border-b border-gray-100"
        style={{
          position: catBarPinned ? 'sticky' : 'relative',
          top: catBarPinned ? '64px' : undefined,
          boxShadow: catBarPinned ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
          transition: 'box-shadow 300ms ease',
        }}
      >
        <div className="flex items-center justify-center overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#121212] text-white'
                    : 'text-gray-500 hover:text-[#121212] hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Article Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </>
        )}

        {!loading && blogPosts.length > 0 && (
          <>
            {/* First two as wide cards */}
            {blogPosts.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                {blogPosts.slice(0, 2).map(post => (
                  <ArticleCard key={post.id || post._id} post={post} />
                ))}
              </div>
            )}

            {/* Section label */}
            {blogPosts.length > 2 && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gray-100" />
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium whitespace-nowrap">More stories</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            )}

            {/* Remaining 3-column grid */}
            {blogPosts.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.slice(2).map(post => (
                  <ArticleCard key={post.id || post._id} post={post} />
                ))}
              </div>
            )}

            {/* Only one card total */}
            {blogPosts.length === 1 && (
              <div className="max-w-sm">
                <ArticleCard post={blogPosts[0]} />
              </div>
            )}
          </>
        )}

        {!loading && blogPosts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-gray-500 text-lg mb-4">No stories in this category yet.</p>
            <button
              onClick={() => selectCategory('all')}
              className="text-sm font-medium text-[var(--color-forest-600)] hover:underline"
            >
              View all stories
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination>
              <PaginationContent className="gap-1.5">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={`rounded-full border-none text-gray-500 hover:text-[#121212] hover:bg-gray-100 ${page === 1 ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className={`rounded-full border-none text-sm font-medium cursor-pointer ${
                          page === pageNum
                            ? 'bg-[#121212] text-white hover:bg-black hover:text-white'
                            : 'text-gray-500 hover:text-[#121212] hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={`rounded-full border-none text-gray-500 hover:text-[#121212] hover:bg-gray-100 ${page === totalPages ? 'pointer-events-none opacity-40' : 'cursor-pointer'}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ── Newsletter ── */}
      <div className="border-t border-gray-100 mt-4 py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">Newsletter</p>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Stories from the trail, monthly
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            New departures, trip announcements and trail dispatches — no spam.
          </p>
          <NewsletterSubscribeForm
            source="blog"
            containerClassName="flex gap-2"
            inputClassName="flex-1 px-4 py-2.5 h-auto rounded-xl border border-gray-200 text-sm focus-visible:ring-0 focus:border-[#121212] transition-colors"
            buttonClassName="px-5 py-2.5 h-auto bg-[#121212] hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            errorClassName="text-sm text-red-500 mt-2"
            buttonLabel={<>Subscribe <ArrowRight size={14} /></>}
          />
        </div>
      </div>

    </div>
  );
}
