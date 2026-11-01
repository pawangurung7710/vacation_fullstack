import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useTestimonials } from '../hooks/useTestimonials';
import { resolveMediaUrl } from '../services/api';

const FALLBACK_REVIEWS = [
	{
		id: 'fallback-1',
		name: 'Sarah Chen',
		location: 'Singapore',
		rating: 5,
		quote: 'Our guides knew every trail and every story. The best trekking week of my life.',
	},
	{
		id: 'fallback-2',
		name: 'Marcus Williams',
		location: 'Toronto, Canada',
		rating: 5,
		quote: 'Small group, great pace and zero stress. I would join the squad again tomorrow.',
	},
	{
		id: 'fallback-3',
		name: 'Priya Sharma',
		location: 'Mumbai, India',
		rating: 5,
		quote: 'Thoughtful planning, warm people and views that are hard to put into words.',
	},
];

function Stars({ rating }: { rating: number }) {
	return (
		<div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
			{[1, 2, 3, 4, 5].map((n) => (
				<Star
					key={n}
					size={16}
					className={n <= Math.round(rating) ? 'fill-[var(--color-sun-400)] text-[var(--color-sun-400)]' : 'text-gray-300'}
				/>
			))}
		</div>
	);
}

export function HomeReviews() {
	const { testimonials, loading } = useTestimonials({ status: 'approved' });
	const [active, setActive] = useState(0);

	const reviews = useMemo(() => {
		const live = testimonials
			.filter((t) => (t.quote || t.testimonial)?.trim())
			.map((t) => ({
				id: t.id || t._id || t.name,
				name: t.name,
				location: t.location,
				rating: t.rating || 5,
				quote: (t.quote || t.testimonial) as string,
				image: t.image,
			}));
		return live.length > 0 ? live : loading ? [] : FALLBACK_REVIEWS;
	}, [testimonials, loading]);

	const average = reviews.length
		? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
		: '5.0';

	useEffect(() => {
		if (reviews.length < 2) return;
		const timer = setInterval(() => setActive((i) => (i + 1) % reviews.length), 7000);
		return () => clearInterval(timer);
	}, [reviews.length]);

	if (reviews.length === 0) return null;

	const current = reviews[active % reviews.length];
	const go = (delta: number) => setActive((i) => (i + delta + reviews.length) % reviews.length);

	return (
		<section className="py-20 bg-[var(--color-navy-900)] text-white relative overflow-hidden">
			<div
				className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[var(--color-forest-500)] opacity-20 blur-3xl"
				aria-hidden
			/>
			<div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-10 lg:gap-16 items-center">
				<div>
					<p className="text-xs uppercase tracking-[0.25em] text-[var(--color-forest-300)] mb-4">Trail talk</p>
					<h2 className="text-3xl sm:text-4xl font-semibold leading-tight mb-6 !text-white">
						Stories from the squad
					</h2>
					<div className="flex items-center gap-3 mb-2">
						<span className="text-5xl font-semibold">{average}</span>
						<div>
							<Stars rating={Number(average)} />
							<p className="text-sm text-white/70 mt-1">
								Average from {reviews.length} traveller{reviews.length === 1 ? '' : 's'}
							</p>
						</div>
					</div>
					<Link
						to="/reviews"
						className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[var(--color-forest-300)] hover:text-white transition-colors"
					>
						Read all reviews <ArrowRight size={16} />
					</Link>
				</div>

				<div className="bg-white text-[var(--color-ink-900)] rounded-3xl p-8 sm:p-10 shadow-2xl">
					<Quote size={36} className="text-[var(--color-forest-500)] mb-4" aria-hidden />
					<blockquote key={current.id} className="text-lg sm:text-xl leading-relaxed min-h-[8rem]">
						{current.quote}
					</blockquote>
					<div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
						<div className="flex items-center gap-3 min-w-0">
							{current.image ? (
								<img
									src={resolveMediaUrl(current.image, { width: 96, height: 96, crop: 'c_fill' })}
									alt=""
									className="w-12 h-12 rounded-full object-cover"
									loading="lazy"
								/>
							) : (
								<div className="w-12 h-12 rounded-full bg-[var(--color-forest-100)] text-[var(--color-forest-700)] flex items-center justify-center font-semibold">
									{current.name?.charAt(0)}
								</div>
							)}
							<div className="min-w-0">
								<p className="font-semibold truncate">{current.name}</p>
								{current.location && <p className="text-sm text-gray-500 truncate">{current.location}</p>}
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<Stars rating={current.rating} />
							{reviews.length > 1 && (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => go(-1)}
										aria-label="Previous review"
										className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
									>
										<ChevronLeft size={16} />
									</button>
									<button
										type="button"
										onClick={() => go(1)}
										aria-label="Next review"
										className="w-9 h-9 rounded-full bg-[var(--color-forest-600)] text-white flex items-center justify-center hover:bg-[var(--color-forest-700)]"
									>
										<ChevronRight size={16} />
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
