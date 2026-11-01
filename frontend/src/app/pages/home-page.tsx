import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import TrekkersIcons from '../components/ui/trekkers-icons';
import {
	ArrowRight, Leaf, Users, Shield, Scale, Calendar, Heart, Mountain,
	Globe, Recycle, TrendingUp, Sparkles, Mail, Sprout, HandHeart, Wheat,
	ChevronLeft, ChevronRight, Clock, Compass, CalendarCheck
} from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { useBlogPosts } from '../hooks/useBlog';
import { pagesApi, resolveMediaUrl, mediaSrcSet } from '../services/api';
import { TripCard } from '../components/trip-card';
import { ScrollAnimate } from '../components/scroll-animate';
import { HeroSearchBar } from '../components/hero-search-bar';
import { HomeReviews } from '../components/home-reviews';
import { CategoryTiles, TrekFinder, WhyTravelWithUs, NewsletterBand } from '../components/home-extras';
import { HeroCarousel } from '../components/hero-carousel';
import defaultHomepageContent from '../data/homepage-content.json';


export type HomepageContent = typeof defaultHomepageContent;

// Older saved homepage content may still have a single `hero.image` object, or
// an interim `hero.images` array with a shared headline, instead of the current
// `hero.slides` array (each slide pairs its own image with its own heading).
// Fold those legacy shapes in so existing CMS data keeps working.
export function normalizeHero(base: HomepageContent['hero'], candidate: unknown): HomepageContent['hero'] {
	const c = candidate && typeof candidate === 'object' ? (candidate as Record<string, unknown>) : {};
	const merged = { ...base, ...c } as any;
	if (!Array.isArray(merged.slides) || merged.slides.length === 0) {
		const legacyImages: Array<{ src?: string; alt?: string }> | undefined = Array.isArray((c as any).images)
			? (c as any).images
			: (c as any).image?.src
				? [(c as any).image]
				: undefined;
		const legacyHeading = [((c as any).line1 as string | undefined), ((c as any).line2 as string | undefined)]
			.filter(Boolean)
			.join(' ');
		merged.slides = legacyImages?.length
			? legacyImages.map((image) => ({ image, heading: legacyHeading || base.slides[0]?.heading || '' }))
			: base.slides;
	}
	delete merged.image;
	delete merged.images;
	delete merged.line1;
	delete merged.line2;
	return merged;
}

function mergeHomepageContent(candidate: unknown): HomepageContent {
	const base = defaultHomepageContent as HomepageContent;
	if (!candidate || typeof candidate !== 'object') return base;
	const c = candidate as Record<string, unknown>;
	return {
		styles: { ...(base as any).styles, ...(c.styles as object) },
		hero: normalizeHero(base.hero, c.hero),
		featuredJourneys: { ...base.featuredJourneys, ...(c.featuredJourneys as object) },
		curateSection: { ...base.curateSection, ...(c.curateSection as object) },
		crowdedTrails: { ...base.crowdedTrails, ...(c.crowdedTrails as object) },
		gallery: { ...base.gallery, ...(c.gallery as object) },
		blogSection: { ...base.blogSection, ...(c.blogSection as object) },
		travelerStories: { ...base.travelerStories, ...(c.travelerStories as object) },
		cta: { ...base.cta, ...(c.cta as object) },
	} as HomepageContent;
}

export function HomePage() {
	const { trips: allTrips, loading: tripsLoading } = useTrips({ featured: true });
	const { trips: everyTrip } = useTrips({ limit: 24 } as any);
	const { posts: blogPosts, loading: blogLoading } = useBlogPosts({ featured: true });
	const [content, setContent] = useState<HomepageContent>(() => defaultHomepageContent as HomepageContent);
	const [activeHeroIndex, setActiveHeroIndex] = useState(0);

	useEffect(() => {
		// The hero renders immediately from the bundled default content (real images
		// + headings) so the LCP image isn't gated behind this request; when the CMS
		// copy arrives we merge it in. A malformed payload or a failed request just
		// leaves the default content in place.
		let isActive = true;
		pagesApi.getByKey('homepage').then((page) => {
			if (!isActive) return;
			const raw = typeof page?.content === 'string' ? page.content : null;
			if (raw) {
				try {
					const parsed = JSON.parse(raw);
					setContent(mergeHomepageContent(parsed));
				} catch {
					/* keep default content */
				}
			}
		}).catch(() => { /* keep default content */ });
		return () => { isActive = false; };
	}, []);

	// Get featured trips (limit to 3)
	const featuredTrips = allTrips.slice(0, 6);

	// Get trips leaving this month
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const getTripDepartureDate = (trip: any) =>
		trip.nextDepartureDate || trip.departures?.[0]?.startDate;
	const tripsThisMonth = allTrips.filter(trip => {
		const tripDepartureDate = getTripDepartureDate(trip);
		if (!tripDepartureDate) return false;
		const departureDate = new Date(tripDepartureDate);
		return departureDate.getMonth() === currentMonth &&
			departureDate.getFullYear() === currentYear;
	}).sort((a, b) => {
		const dateA = new Date(getTripDepartureDate(a)!).getTime();
		const dateB = new Date(getTripDepartureDate(b)!).getTime();
		return dateA - dateB;
	});

	const blogCategoryLabels: Record<string, string> = {
		destinations: 'Destinations',
		gear: 'Gear & Kit',
		training: 'Training',
		stories: 'Trail Stories',
		safety: 'Safety',
		guides: 'Guide Notes',
	};

	const bentoCategoryColors: Record<string, string> = {
		destinations: 'bg-sky-700',
		gear: 'bg-slate-700',
		training: 'bg-[var(--color-forest-700)]',
		stories: 'bg-purple-700',
		safety: 'bg-red-700',
		guides: 'bg-[var(--color-forest-600)]',
	};

	const BENTO_LAYOUT = [
		{ span: 'md:col-span-2 md:row-span-2', textSize: 'text-2xl sm:text-3xl' },
		{ span: 'md:col-span-1 md:row-span-1', textSize: 'text-lg' },
		{ span: 'md:col-span-1 md:row-span-1', textSize: 'text-lg' },
		{ span: 'md:col-span-2 md:row-span-1', textSize: 'text-xl' },
		{ span: 'md:col-span-1 md:row-span-1', textSize: 'text-lg' },
	];

	const s = (content as any).styles as Record<string, string> | undefined;
	const themeVars: React.CSSProperties = {};
	if (s?.primaryColor) themeVars['--home-primary' as any] = s.primaryColor;
	if (s?.primaryColorHover) themeVars['--home-primary-hover' as any] = s.primaryColorHover;
	if (s?.sectionHeadingColor) themeVars['--home-heading' as any] = s.sectionHeadingColor;
	if (s?.subtitleColor) themeVars['--home-subtitle' as any] = s.subtitleColor;
	if (s?.accentColor) themeVars['--home-accent' as any] = s.accentColor;
	if (s?.buttonBorderRadius) themeVars['--home-button-radius' as any] = s.buttonBorderRadius;
	if (s?.heroOverlay) themeVars['--home-hero-overlay' as any] = s.heroOverlay;

	const hasTheme = Object.keys(themeVars).length > 0;

	return (
		<div
			className="min-h-screen"
			style={hasTheme ? themeVars : undefined}
			data-homepage-theme={hasTheme ? '' : undefined}
		>
			{hasTheme && (
				<style>{`[data-homepage-theme] button { border-radius: var(--home-button-radius, 0.5rem); }`}</style>
			)}
			{/* Hero - full-bleed, left-aligned headline with the search panel docked at the bottom */}
			<section className="relative h-[88vh] min-h-[600px] max-h-[860px] bg-[var(--color-navy-900)] overflow-hidden">
				<HeroCarousel
					images={content.hero.slides.map((slide) => ({
						...slide.image,
						src: resolveMediaUrl(slide.image?.src, { width: 1920, ar: '16:9', crop: 'c_fill' }),
						srcSet: mediaSrcSet(slide.image?.src, [960, 1280, 1600, 1920, 2400], { ar: '16:9', crop: 'c_fill' }),
						sizes: '100vw',
						width: 1920,
						height: 1080,
					}))}
					onIndexChange={setActiveHeroIndex}
				/>
				<div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 md:pb-14 pointer-events-none">
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-300)] mb-4 font-medium">
						Small groups · Local guides · Big mountains
					</p>
					<h1
						key={activeHeroIndex}
						className="text-4xl sm:text-6xl md:text-7xl mb-8 text-white glass-text-contrast-heavy leading-[1.05] animate-fade-in-up max-w-3xl font-semibold"
					>
						{content.hero.slides[activeHeroIndex]?.heading}
					</h1>
					<div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '720ms' }}>
						<Link to={content.hero.primaryCta.href} className="pointer-events-auto">
							<Button size="lg" className="px-10 bg-[var(--home-primary,var(--color-forest-600))] hover:bg-[var(--home-primary-hover,var(--color-forest-700))] shadow-2xl cursor-pointer">
								{content.hero.primaryCta.label}
							</Button>
						</Link>
						<Link to="/all-trips" className="pointer-events-auto text-white/90 hover:text-white text-sm font-medium inline-flex items-center gap-2">
							Browse every trip <ArrowRight size={16} />
						</Link>
					</div>
					<div className="pointer-events-auto w-full max-w-3xl">
						<HeroSearchBar className="!max-w-none" />
					</div>
				</div>
			</section>

			{/* Quick facts band */}
			<section className="bg-[var(--color-navy-900)] text-white border-t border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
					{[
						{ k: '12', v: 'People max per group' },
						{ k: '100%', v: 'Local, certified guides' },
						{ k: '24/7', v: 'On-trip support' },
						{ k: '4.9★', v: 'Average traveller rating' },
					].map((f) => (
						<div key={f.v}>
							<div className="text-2xl md:text-3xl font-semibold text-[var(--color-forest-400)]">{f.k}</div>
							<div className="text-sm text-white/70">{f.v}</div>
						</div>
					))}
				</div>
			</section>

			<CategoryTiles />

			{/* Featured Journeys - responsive grid */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<ScrollAnimate animation="fade-in-up">
						<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">Hand-picked</p>
								<h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">{content.featuredJourneys.title}</h2>
							</div>
							<Link to="/all-trips">
								<Button variant="outline" className="gap-2">
									{content.featuredJourneys.viewAllLabel}
									<ArrowRight size={16} />
								</Button>
							</Link>
						</div>
					</ScrollAnimate>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{tripsLoading ? (
							Array.from({ length: 3 }).map((_, index) => (
								<Card key={`trip-skeleton-${index}`} className="overflow-hidden rounded-3xl">
									<Skeleton className="aspect-[4/3] w-full" />
									<CardContent className="p-5 space-y-3">
										<Skeleton className="h-6 w-3/4" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-1/2" />
									</CardContent>
								</Card>
							))
						) : featuredTrips.length === 0 ? (
							<div className="col-span-full text-center py-8 text-gray-600">No featured trips available</div>
						) : (
							featuredTrips.map((trip) => <TripCard key={trip.id || trip._id} trip={trip} />)
						)}
					</div>
				</div>
			</section>

			<TrekFinder />

			{/* More trips - everything that is not already featured above */}
			{(() => {
				const featuredIds = new Set(featuredTrips.map((t) => t.id || t._id));
				const more = everyTrip.filter((t) => !featuredIds.has(t.id || t._id)).slice(0, 6);
				if (more.length === 0) return null;
				return (
					<section className="py-20 bg-[var(--color-navy-50)]">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">More to explore</p>
									<h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">Popular right now</h2>
								</div>
								<Link to="/all-trips"><Button variant="outline" className="gap-2">See all trips <ArrowRight size={16} /></Button></Link>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{more.map((trip) => <TripCard key={trip.id || trip._id} trip={trip} />)}
							</div>
						</div>
					</section>
				);
			})()}

			<section className="py-10 bg-white relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<ScrollAnimate animation="fade-in-up">
						<h2 className="text-3xl md:text-4xl font-semibold text-center text-[var(--home-heading,var(--color-forest-600))] uppercase tracking-wide mb-10">
							{content.curateSection.heading}
						</h2>
					</ScrollAnimate>
					<div className="grid grid-cols-1 md:grid-cols-[6fr_5fr] gap-8 md:gap-12 items-start">
						<ScrollAnimate animation="slide-in-left">
							<div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-xl">
								<img
									src={resolveMediaUrl(content.curateSection.image1.src, { width: 1000 })}
									srcSet={mediaSrcSet(content.curateSection.image1.src, [480, 720, 1000, 1280])}
									sizes="(min-width: 768px) 55vw, 100vw"
									alt={content.curateSection.image1.alt}
									loading="lazy"
									decoding="async"
									className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
								/>
							</div>
						</ScrollAnimate>
						<ScrollAnimate animation="slide-in-right">
							<div className="space-y-8">
								{content.curateSection.description && (
									<p className="text-gray-700 text-base leading-relaxed">
										{content.curateSection.description}
									</p>
								)}
								{(content.crowdedTrails.ctaLabel) && (
									<Link to={content.crowdedTrails.ctaHref || '/about'}>
										<Button variant="outline" size="sm" className="gap-2">
											{content.crowdedTrails.ctaLabel}
											<ArrowRight size={16} />
										</Button>
									</Link>
								)}
							</div>
						</ScrollAnimate>
					</div>
				</div>
			</section>

			{/* Stories from the Trail — Bento Grid */}
			<section className="py-20 bg-[#0f0f0f]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

					{/* Header */}
					<ScrollAnimate animation="fade-in-up">
						<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-3 font-medium">From the journal</p>
								<h2
									className="text-5xl md:text-6xl font-black text-white leading-none"
									style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}
								>
									Stories from<br className="hidden sm:block" /> the mountains
								</h2>
							</div>
							<Link
								to="/blog"
								className="self-start sm:self-auto flex items-center gap-2 border border-white/20 hover:border-white/50 text-white/70 hover:text-white text-sm font-semibold px-6 py-3 rounded-full transition-all whitespace-nowrap"
							>
								All stories <ArrowRight size={14} />
							</Link>
						</div>
					</ScrollAnimate>

					{/* Bento grid — real posts from the blog API */}
					{blogLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-3">
							{BENTO_LAYOUT.map((layout, i) => (
								<div key={i} className={`${layout.span} rounded-2xl bg-white/5 animate-pulse`} />
							))}
						</div>
					) : blogPosts.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-3">
							{blogPosts.slice(0, 5).map((post, i) => {
								const layout = BENTO_LAYOUT[i];
								const categoryLabel = blogCategoryLabels[post.category] || post.category;
								const categoryColor = bentoCategoryColors[post.category] || 'bg-[var(--color-forest-600)]';
								return (
									<ScrollAnimate key={post.id || post._id} animation="fade-in-up" delay={i * 60} className={layout.span}>
										<Link
											to={`/blog/${post.slug || post._id}`}
											className="group relative overflow-hidden rounded-2xl block h-full"
										>
											{/* Image — alt="" because the post title is rendered as visible
											    text inside this same link; a smaller display-sized crop. An
											    imageless post just shows the gradient over a dark tile. */}
											{(() => {
												const raw = post.image || post.featuredImage || '';
												if (!raw) return null;
												return (
													<img
														src={resolveMediaUrl(raw, { width: 700, ar: '4:3', crop: 'c_fill' })}
														srcSet={mediaSrcSet(raw, [360, 540, 800], { ar: '4:3', crop: 'c_fill' })}
														sizes="(min-width: 768px) 33vw, 100vw"
														alt=""
														loading="lazy"
														decoding="async"
														className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
													/>
												);
											})()}

											{/* Always-on gradient */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

											{/* Hover overlay */}
											<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

											{/* Category pill — top left */}
											{categoryLabel && (
												<div className="absolute top-4 left-4">
													<span className={`inline-block text-xs font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full ${categoryColor}`}>
														{categoryLabel}
													</span>
												</div>
											)}

											{/* Read arrow — top right, appears on hover */}
											<div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
												<ArrowRight size={15} className="text-[#0f0f0f]" />
											</div>

											{/* Content — bottom */}
											<div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
												<h3
													className={`text-white font-bold leading-snug mb-2 ${layout.textSize}`}
													style={{ fontFamily: 'Outfit, sans-serif' }}
												>
													{post.title}
												</h3>
												{post.readTime && (
													<div className="flex items-center gap-1.5 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
														<Clock size={11} />
														<span>{post.readTime}</span>
													</div>
												)}
											</div>
										</Link>
									</ScrollAnimate>
								);
							})}
						</div>
					)}
				</div>
			</section>




			{/* How it works */}
			<section className="py-20 bg-[var(--color-navy-50)]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<ScrollAnimate animation="fade-in-up">
						<div className="text-center max-w-2xl mx-auto mb-14">
							<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">How it works</p>
							<h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)] mb-4">From idea to summit in three steps</h2>
							<p className="text-gray-600">We handle permits, guides, stays and logistics so all you need to bring is good boots.</p>
						</div>
					</ScrollAnimate>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ n: '01', icon: Compass, t: 'Pick your trail', d: 'Browse treks, tours and short activities by region, difficulty and season.' },
							{ n: '02', icon: CalendarCheck, t: 'Lock in a date', d: 'Choose a departure, reserve your spot online and get a clear packing list.' },
							{ n: '03', icon: Mountain, t: 'Hit the trail', d: 'Meet your guide and your squad, then let the mountains do the rest.' },
						].map((step) => (
							<div key={step.n} className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow">
								<span className="absolute top-6 right-8 text-4xl font-semibold text-[var(--color-forest-700)]">{step.n}</span>
								<div className="w-14 h-14 rounded-2xl bg-[var(--color-forest-100)] text-[var(--color-forest-700)] flex items-center justify-center mb-6">
									<step.icon size={26} />
								</div>
								<h3 className="text-xl font-semibold mb-2">{step.t}</h3>
								<p className="text-gray-600 leading-relaxed">{step.d}</p>
							</div>
						))}
					</div>
				</div>
			</section>



			<WhyTravelWithUs />

			{/* Reviews */}
			<HomeReviews />

			<NewsletterBand />


		</div>
	);
}
