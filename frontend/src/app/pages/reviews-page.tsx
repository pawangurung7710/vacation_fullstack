import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { useTestimonials, type Testimonial } from '../hooks/useTestimonials';
import { resolveMediaUrl } from '../services/api';

const heroImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920';

function formatReviewDate(iso?: string) {
  if (!iso) return '';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? 'fill-[var(--color-sun-500)] text-[var(--color-sun-500)]' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, featured }: { review: Testimonial; featured?: boolean }) {
  const avatar = resolveMediaUrl(review.image);
  const tripLabel = typeof review.trip === 'string' ? review.trip : review.trip?.title;
  const tripHref = typeof review.trip === 'object' && review.trip ? `/trip/${review.trip.slug || review.trip._id}` : null;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 flex flex-col gap-5 ${featured ? 'p-8' : 'p-6'}`}>
      {/* Quote icon */}
      <Quote size={featured ? 28 : 20} className="text-[var(--color-navy-600)] opacity-40 flex-shrink-0" />

      {/* Stars */}
      <StarRow rating={review.rating || 0} size={featured ? 16 : 13} />

      {/* Quote text */}
      <p
        className={`text-[#121212] leading-relaxed flex-1 ${featured ? 'text-lg font-light' : 'text-sm'}`}
        style={{ fontFamily: featured ? "'Georgia', serif" : undefined }}
      >
        &ldquo;{review.quote || review.testimonial}&rdquo;
      </p>

      {/* Trip badge */}
      {tripLabel && (
        tripHref ? (
          <Link to={tripHref} className="text-xs uppercase tracking-widest text-[var(--color-navy-600)] font-semibold hover:underline">
            {tripLabel}
          </Link>
        ) : (
          <p className="text-xs uppercase tracking-widest text-[var(--color-navy-600)] font-semibold">
            {tripLabel}
          </p>
        )
      )}

      {/* Reviewer */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
        {avatar && (
          <img
            src={avatar}
            alt={review.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div>
          <p className="text-sm font-semibold text-[#121212]">{review.name}</p>
          <p className="text-xs text-gray-500">
            {[review.location, formatReviewDate((review as any).createdAt)].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewCardSkeleton({ featured }: { featured?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 flex flex-col gap-5 animate-pulse ${featured ? 'p-8' : 'p-6'}`}>
      <div className="w-6 h-6 bg-gray-100 rounded" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-4 h-4 bg-gray-100 rounded-full" />)}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-11/12 bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-2.5 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ReviewsPage() {
  const { testimonials, loading } = useTestimonials({ status: 'approved' });
  const [filter, setFilter] = useState<number | null>(null);
  const visible = filter ? testimonials.filter(r => r.rating === filter) : testimonials;

  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, r) => s + (r.rating || 0), 0) / testimonials.length).toFixed(1)
    : '—';

  const distribution = [5, 4, 3, 2, 1].map(n => {
    const count = testimonials.filter(r => r.rating === n).length;
    return {
      stars: n,
      count,
      pct: testimonials.length > 0 ? Math.round((count / testimonials.length) * 100) : 0,
    };
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212]">

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '55vh', minHeight: '400px' }}>
        <img
          src={heroImage}
          alt="mountain peaks"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        {/* Masthead centred */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-3 font-medium">
            Traveller reviews
          </p>
          <h1
            className="font-black text-white leading-none mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}
          >
            Stories from the trail
          </h1>
          <p className="text-white/65 text-base max-w-sm">
            Unfiltered experiences from travellers who&apos;ve walked with us through the mountains.
          </p>
        </div>
      </div>

      {/* ── Aggregate Score ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">

          {/* Big number */}
          <div className="text-center flex-shrink-0">
            <p
              className="font-black text-[#121212] leading-none"
              style={{ fontFamily: 'Outfit, sans-serif', fontSize: '5rem' }}
            >
              {avgRating}
            </p>
            <StarRow rating={5} size={18} />
            <p className="text-xs text-gray-500 mt-2">out of 5</p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-2.5">
            {distribution.map(d => (
              <button
                key={d.stars}
                onClick={() => setFilter(filter === d.stars ? null : d.stars)}
                className={`w-full flex items-center gap-3 group rounded-lg px-2 py-1 transition-colors ${filter === d.stars ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={11} className={s <= d.stars ? 'fill-[var(--color-sun-500)] text-[var(--color-sun-500)]' : 'fill-gray-200 text-gray-200'} />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-sun-500)] rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right flex-shrink-0">{d.count}</span>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="text-center sm:text-right flex-shrink-0">
            <p className="text-sm font-semibold text-[#121212]">{testimonials.length} verified reviews</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[140px]">All from travellers who completed a Trekkers Squad trip</p>
            <Link
              to="/all-trips"
              className="mt-4 inline-flex items-center gap-1.5 bg-[#121212] text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-black transition-colors"
            >
              Book a trip <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Filter notice ── */}
      {filter && (
        <div className="max-w-5xl mx-auto px-6 mt-6 flex items-center gap-3">
          <p className="text-sm text-gray-500">
            Showing <strong>{filter}-star</strong> reviews ({visible.length})
          </p>
          <button onClick={() => setFilter(null)} className="text-xs text-[var(--color-navy-600)] hover:underline">
            Clear filter
          </button>
        </div>
      )}

      {/* ── Review Grid ── */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        {loading ? (
          <div className="columns-1 sm:columns-2 gap-6 space-y-6">
            <div className="break-inside-avoid"><ReviewCardSkeleton featured /></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="break-inside-avoid"><ReviewCardSkeleton /></div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {testimonials.length === 0 ? 'No reviews yet. Check back soon for traveller stories.' : 'No reviews at this rating yet.'}
          </p>
        ) : (
          <div className="columns-1 sm:columns-2 gap-6 space-y-6">
            {visible.map((r, i) => (
              <div key={r.id || r._id || i} className="break-inside-avoid">
                <ReviewCard review={r} featured={i === 0 && !filter} />
              </div>
            ))}
          </div>
        )}

        {/* CTA strip */}
        <div
          className="mt-16 rounded-2xl overflow-hidden relative"
          style={{ minHeight: '220px' }}
        >
          <img
            src="https://images.unsplash.com/photo-1572109801525-0bb0272e8579?w=1400&h=500&fit=crop&auto=format"
            alt="Trek"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
            <p className="text-white/60 text-xs uppercase tracking-widest">Ready to write your own story?</p>
            <h3
              className="text-white font-bold text-2xl sm:text-3xl"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Join a Trekkers Squad trek
            </h3>
            <Link
              to="/all-trips"
              className="mt-2 inline-flex items-center gap-2 bg-white text-[#121212] font-bold text-sm px-7 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Browse all trips <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
