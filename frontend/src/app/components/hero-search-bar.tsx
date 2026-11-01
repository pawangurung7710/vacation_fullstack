import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { MapPin, Calendar as CalendarIcon, Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { tripsApi, resolveMediaUrl } from '../services/api';

const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 5;

const PLACEHOLDER_PHRASES = [
	'Search destination',
	'Search Trips',
	'Search Treks',
	'Search experiences',
	'Search expeditions',
];
const TYPE_SPEED_MS = 70;
const DELETE_SPEED_MS = 35;
const PAUSE_AFTER_TYPE_MS = 1500;
const PAUSE_AFTER_DELETE_MS = 300;

interface HeroSearchBarProps {
	className?: string;
}

export function HeroSearchBar({ className = '' }: HeroSearchBarProps = {}) {
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement>(null);
	const [destination, setDestination] = useState('');
	const [range, setRange] = useState<DateRange | undefined>();
	const [datesOpen, setDatesOpen] = useState(false);
	const [resultsOpen, setResultsOpen] = useState(false);
	const [results, setResults] = useState<any[]>([]);
	const [searching, setSearching] = useState(false);
	const [typedPlaceholder, setTypedPlaceholder] = useState('');
	const [placeholderPhraseIndex, setPlaceholderPhraseIndex] = useState(0);
	const [placeholderDeleting, setPlaceholderDeleting] = useState(false);

	const trimmedQuery = destination.trim();

	// Typewriter effect: types out each phrase, pauses, deletes it, then moves to
	// the next one, looping through the list forever.
	useEffect(() => {
		const currentPhrase = PLACEHOLDER_PHRASES[placeholderPhraseIndex];
		let timeout: ReturnType<typeof setTimeout>;

		if (!placeholderDeleting && typedPlaceholder === currentPhrase) {
			timeout = setTimeout(() => setPlaceholderDeleting(true), PAUSE_AFTER_TYPE_MS);
		} else if (placeholderDeleting && typedPlaceholder === '') {
			timeout = setTimeout(() => {
				setPlaceholderDeleting(false);
				setPlaceholderPhraseIndex((i) => (i + 1) % PLACEHOLDER_PHRASES.length);
			}, PAUSE_AFTER_DELETE_MS);
		} else {
			const next = placeholderDeleting
				? currentPhrase.slice(0, typedPlaceholder.length - 1)
				: currentPhrase.slice(0, typedPlaceholder.length + 1);
			timeout = setTimeout(() => setTypedPlaceholder(next), placeholderDeleting ? DELETE_SPEED_MS : TYPE_SPEED_MS);
		}

		return () => clearTimeout(timeout);
	}, [typedPlaceholder, placeholderDeleting, placeholderPhraseIndex]);

	const dateLabel = range?.from
		? range.to
			? `${format(range.from, 'MMM d')} – ${format(range.to, 'MMM d')}`
			: format(range.from, 'MMM d')
		: null;

	useEffect(() => {
		if (trimmedQuery.length < MIN_QUERY_LENGTH) {
			setResults([]);
			setSearching(false);
			return;
		}
		setSearching(true);
		const timeout = setTimeout(async () => {
			try {
				const data = await tripsApi.getAll({ search: trimmedQuery, limit: RESULTS_LIMIT });
				setResults(Array.isArray(data) ? data : []);
			} catch {
				setResults([]);
			} finally {
				setSearching(false);
			}
		}, 350);
		return () => clearTimeout(timeout);
	}, [trimmedQuery]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setResultsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearch = () => {
		setResultsOpen(false);
		const params = new URLSearchParams();
		if (trimmedQuery) params.set('search', trimmedQuery);
		if (range?.from) params.set('minDepartureDate', format(range.from, 'yyyy-MM-dd'));
		if (range?.to) params.set('maxDepartureDate', format(range.to, 'yyyy-MM-dd'));
		navigate(`/all-trips${params.toString() ? `?${params.toString()}` : ''}`);
	};

	const showDropdown = resultsOpen && trimmedQuery.length >= MIN_QUERY_LENGTH;

	return (
		<div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
			<div className={`bg-[var(--color-navy-900)]/85 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl transition-shadow duration-500 ease-out flex flex-col sm:flex-row sm:items-stretch p-2 gap-2 ${className}`}>
				<label className="relative flex items-center gap-3 flex-[1.4] min-w-0 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-[var(--color-forest-400)] transition-colors cursor-text">
					<MapPin size={20} className="text-[var(--color-forest-300)] flex-shrink-0" />
					<div className="relative flex-1 min-w-0">
						<span className="block text-xs uppercase tracking-[0.2em] text-white/60 leading-none mb-1">Where to?</span>
						<div className="relative">
							<Input
								value={destination}
								onChange={(e) => {
									setDestination(e.target.value);
									setResultsOpen(true);
								}}
								onFocus={() => {
									if (trimmedQuery.length >= MIN_QUERY_LENGTH) setResultsOpen(true);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSearch();
									if (e.key === 'Escape') setResultsOpen(false);
								}}
								aria-label="Search destination"
								className="relative z-10 border-0 shadow-none bg-transparent focus-visible:ring-0 h-auto p-0 text-base text-white"
							/>
							{!destination && (
								<div className="pointer-events-none absolute inset-0 flex items-center text-base text-white/70 overflow-hidden whitespace-nowrap">
									<span>{typedPlaceholder}</span>
									<span className="inline-block w-[2px] h-4 ml-0.5 bg-[var(--color-forest-300)] animate-pulse" aria-hidden />
								</div>
							)}
						</div>
					</div>
				</label>

				<Popover open={datesOpen} onOpenChange={setDatesOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center gap-3 flex-1 px-4 py-2.5 text-left cursor-pointer rounded-xl bg-white/10 hover:bg-white/15 transition-colors min-w-0"
						>
							<CalendarIcon size={20} className="text-[var(--color-forest-300)] flex-shrink-0" />
							<span className="min-w-0">
								<span className="block text-xs uppercase tracking-[0.2em] text-white/60 leading-none mb-1">When?</span>
								<span className={`block text-base whitespace-nowrap truncate ${dateLabel ? 'text-white' : 'text-white/70'}`}>
									{dateLabel ?? 'Add dates'}
								</span>
							</span>
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="range"
							selected={range}
							onSelect={setRange}
							numberOfMonths={2}
							disabled={{ before: new Date() }}
							initialFocus
						/>
					</PopoverContent>
				</Popover>

				<Button
					type="button"
					size="md"
					onClick={handleSearch}
					aria-label="Search"
					className="!rounded-xl flex-shrink-0 sm:px-7 h-12 sm:h-auto gap-2 bg-[var(--color-forest-500)] hover:bg-[var(--color-forest-600)] cursor-pointer justify-center font-semibold"
				>
					<Search size={18} />
					Explore
				</Button>
			</div>

			{showDropdown && (
				<div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden">
					{searching ? (
						<div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
							<Loader2 size={16} className="animate-spin" />
							Searching trips…
						</div>
					) : results.length > 0 ? (
						<>
							<ul className="max-h-80 overflow-y-auto">
								{results.map((trip) => (
									<li key={trip.id || trip._id}>
										<Link
											to={`/trip/${trip.slug || trip.id || trip._id}`}
											onClick={() => setResultsOpen(false)}
											className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
										>
											<img
												src={resolveMediaUrl(trip.image || trip.featuredImage, { width: 112, height: 112, crop: 'c_fill' })}
												alt=""
												loading="lazy"
												decoding="async"
												className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100"
											/>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-[var(--color-ink-900)] truncate">{trip.title}</p>
												<p className="text-xs text-gray-500 truncate">
													{trip.region}{trip.duration ? ` · ${trip.duration} days` : ''}
												</p>
											</div>
											{trip.price != null && (
												<span className="text-sm text-gray-700 flex-shrink-0">US ${trip.price}</span>
											)}
										</Link>
									</li>
								))}
							</ul>
							<Link
								to={`/all-trips?search=${encodeURIComponent(trimmedQuery)}`}
								onClick={() => setResultsOpen(false)}
								className="block px-4 py-3 text-sm font-medium text-center text-[var(--color-forest-600)] hover:bg-gray-50 border-t border-gray-100"
							>
								See all results for "{trimmedQuery}"
							</Link>
						</>
					) : (
						<div className="px-4 py-4 text-sm text-gray-500">No trips found for "{trimmedQuery}"</div>
					)}
				</div>
			)}
		</div>
	);
}
