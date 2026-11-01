import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, HeartHandshake, MapPin, Search, ShieldCheck, Users, Wallet } from 'lucide-react';
import { categoriesApi } from '../services/api';
import { Button } from './ui/button';
import { NewsletterSubscribeForm } from './newsletter-subscribe-form';
import { ScrollAnimate } from './scroll-animate';

const TILE_IMAGES = [
	'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
	'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
	'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1200&q=85',
	'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&w=1200&q=85',
];

export function CategoryTiles() {
	const [categories, setCategories] = useState<Array<{ _id: string; label: string; slug: string; order?: number }>>([]);

	useEffect(() => {
		let cancelled = false;
		categoriesApi
			.getAll({ level: 0, isActive: true })
			.then((data) => {
				if (!cancelled && Array.isArray(data)) setCategories([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 4));
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	if (categories.length === 0) return null;

	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollAnimate animation="fade-in-up">
					<div className="mb-10">
						<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">Browse by style</p>
						<h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">Pick how you want to travel</h2>
					</div>
				</ScrollAnimate>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					{categories.map((cat, i) => (
						<Link
							key={cat._id}
							to={`/trips/${cat.slug}`}
							className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-[var(--color-navy-800)]"
						>
							<img
								src={TILE_IMAGES[i % TILE_IMAGES.length]}
								alt=""
								loading="lazy"
								decoding="async"
								className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
							<div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-2">
								<span className="text-white text-xl md:text-2xl font-semibold leading-tight">{cat.label}</span>
								<span className="w-10 h-10 rounded-full bg-white/90 text-[var(--color-navy-900)] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[var(--color-forest-400)]">
									<ArrowRight size={18} />
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}

const DURATIONS = [
	{ label: 'Any length', min: '', max: '' },
	{ label: '1–3 days', min: '1', max: '3' },
	{ label: '4–7 days', min: '4', max: '7' },
	{ label: '8–14 days', min: '8', max: '14' },
	{ label: '15+ days', min: '15', max: '' },
];

const fieldClass =
	'w-full h-12 rounded-xl bg-white/10 border border-white/15 text-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-forest-400)] placeholder:text-white/70';

export function TrekFinder() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [difficulty, setDifficulty] = useState('all');
	const [duration, setDuration] = useState(0);

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams();
		if (query.trim()) params.set('search', query.trim());
		if (difficulty !== 'all') params.set('difficulty', difficulty);
		const d = DURATIONS[duration];
		if (d.min) params.set('minDuration', d.min);
		if (d.max) params.set('maxDuration', d.max);
		navigate(`/all-trips${params.toString() ? `?${params.toString()}` : ''}`);
	};

	return (
		<section className="relative py-20 bg-[var(--color-navy-900)] overflow-hidden">
			<img
				src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80"
				alt=""
				loading="lazy"
				decoding="async"
				className="absolute inset-0 w-full h-full object-cover opacity-25"
			/>
			<div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy-900)] via-[var(--color-navy-900)]/80 to-transparent" />
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-400)] mb-3 font-medium">Trek finder</p>
					<h2 className="text-3xl md:text-5xl font-semibold !text-white leading-tight mb-4">Not sure where to start?</h2>
					<p className="text-white/70 max-w-md">Tell us how tough and how long, and we will show you the trails that fit.</p>
				</div>
				<form onSubmit={submit} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 md:p-6 grid sm:grid-cols-2 gap-4">
					<label className="sm:col-span-2 relative">
						<span className="sr-only">Search trips</span>
						<MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-forest-400)]" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Region, trek or keyword"
							className={`${fieldClass} pl-11`}
						/>
					</label>
					<label>
						<span className="sr-only">Difficulty</span>
						<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={fieldClass}>
							<option value="all" className="text-black">Any difficulty</option>
							<option value="easy" className="text-black">Easy</option>
							<option value="moderate" className="text-black">Moderate</option>
							<option value="challenging" className="text-black">Challenging</option>
							<option value="expert" className="text-black">Expert</option>
						</select>
					</label>
					<label>
						<span className="sr-only">Duration</span>
						<select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={fieldClass}>
							{DURATIONS.map((d, i) => (
								<option key={d.label} value={i} className="text-black">{d.label}</option>
							))}
						</select>
					</label>
					<Button type="submit" size="lg" className="sm:col-span-2 gap-2 bg-[var(--color-forest-500)] hover:bg-[var(--color-forest-600)] cursor-pointer">
						<Search size={18} /> Show matching trips
					</Button>
				</form>
			</div>
		</section>
	);
}

const REASONS = [
	{ icon: Users, title: 'Small groups', body: 'Never more than a dozen people, so the trail feels like yours.' },
	{ icon: Compass, title: 'Local guides', body: 'Born in the mountains, certified, and full of stories.' },
	{ icon: ShieldCheck, title: 'Safety first', body: 'First-aid trained crews and 24/7 backup from our office.' },
	{ icon: Wallet, title: 'Honest pricing', body: 'One clear price. No surprise fees at the trailhead.' },
	{ icon: HeartHandshake, title: 'Flexible booking', body: 'Reserve with a small deposit and change dates when plans shift.' },
	{ icon: MapPin, title: 'Off the beaten path', body: 'Quieter routes beyond the usual crowded checkpoints.' },
];

export function WhyTravelWithUs() {
	return (
		<section className="py-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollAnimate animation="fade-in-up">
					<div className="max-w-2xl mb-12">
						<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">Why the squad</p>
						<h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">Built for people who love the outdoors</h2>
					</div>
				</ScrollAnimate>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
					{REASONS.map((r) => (
						<div key={r.title} className="flex gap-5">
							<div className="w-12 h-12 rounded-2xl bg-[var(--color-navy-900)] text-[var(--color-forest-400)] flex items-center justify-center flex-shrink-0">
								<r.icon size={22} />
							</div>
							<div>
								<h3 className="text-lg font-semibold mb-1">{r.title}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">{r.body}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function NewsletterBand() {
	return (
		<section className="py-16 bg-[var(--color-forest-50)]">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-3xl md:text-4xl font-semibold text-[var(--color-navy-900)] mb-3">Trail notes, straight to your inbox</h2>
				<p className="text-gray-600 mb-8 max-w-xl mx-auto">New departures, packing tips and the occasional early-bird deal. No spam.</p>
				<div className="max-w-lg mx-auto">
					<NewsletterSubscribeForm source="homepage" placeholder="you@example.com" buttonLabel="Join the squad" />
				</div>
			</div>
		</section>
	);
}
