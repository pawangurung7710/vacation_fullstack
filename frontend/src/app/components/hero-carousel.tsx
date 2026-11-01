import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroImage {
	src: string;
	alt: string;
	srcSet?: string;
	sizes?: string;
	/** Intrinsic dimensions of the served crop, so the browser can reserve the
	 *  aspect ratio before the image loads (CSS still stretches it to the box). */
	width?: number;
	height?: number;
}

interface HeroCarouselProps {
	images: HeroImage[];
	autoPlayMs?: number;
	onIndexChange?: (index: number) => void;
}

export function HeroCarousel({ images, autoPlayMs = 6000, onIndexChange }: HeroCarouselProps) {
	const slides = images.filter((img) => img?.src);
	const [index, setIndex] = useState(0);
	const [firstLoaded, setFirstLoaded] = useState(false);
	// Which slides have actually been requested. Only slide 0 loads up front; the
	// others are added the first time they're shown, so a 3-slide hero costs one
	// image on load instead of three competing for bandwidth during LCP.
	const [requested, setRequested] = useState<Set<number>>(() => new Set([0]));
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		onIndexChange?.(index);
		setRequested((prev) => {
			if (prev.has(index)) return prev;
			const next = new Set(prev);
			next.add(index);
			return next;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [index]);

	// Once the LCP image is in, quietly pull in the next slide so the first
	// auto-advance crossfade doesn't start from a blank frame.
	useEffect(() => {
		if (!firstLoaded || slides.length <= 1) return;
		setRequested((prev) => {
			if (prev.has(1)) return prev;
			const next = new Set(prev);
			next.add(1);
			return next;
		});
	}, [firstLoaded, slides.length]);

	// Slide count can change (e.g. CMS content reloads with fewer slides) — snap back in range.
	useEffect(() => {
		setIndex((current) => (slides.length === 0 ? 0 : current % slides.length));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slides.length]);

	const goTo = (next: number) => {
		const count = slides.length;
		setIndex(((next % count) + count) % count);
	};

	const stopAutoPlay = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};

	const startAutoPlay = () => {
		stopAutoPlay();
		if (slides.length <= 1 || !autoPlayMs) return;
		timerRef.current = setInterval(() => {
			setIndex((current) => (current + 1) % slides.length);
		}, autoPlayMs);
	};

	useEffect(() => {
		startAutoPlay();
		return stopAutoPlay;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slides.length, autoPlayMs]);

	if (slides.length === 0) return null;

	return (
		<div
			className="absolute inset-0"
			onMouseEnter={stopAutoPlay}
			onMouseLeave={startAutoPlay}
		>
			{slides.map((image, i) => (
				<img
					key={i}
					src={requested.has(i) ? image.src : undefined}
					srcSet={requested.has(i) ? image.srcSet : undefined}
					sizes={image.sizes}
					width={image.width}
					height={image.height}
					alt={image.alt}
					className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
						i === index ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
					} ${i === index ? 'animate-hero-zoom' : ''} ${
						i === 0 && !firstLoaded ? 'opacity-0' : ''
					}`}
					fetchPriority={i === 0 ? 'high' : undefined}
					loading={i === 0 ? 'eager' : 'lazy'}
					decoding={i === 0 ? undefined : 'async'}
					onLoad={i === 0 ? () => setFirstLoaded(true) : undefined}
				/>
			))}

			{/* Readability: darker on the left where the headline sits, and along the bottom */}
			<div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" aria-hidden />
			<div className="absolute inset-x-0 bottom-0 h-1/2 z-[2] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" aria-hidden />

			{slides.length > 1 && (
				<div className="absolute z-10 top-24 right-4 sm:right-8 lg:right-12 flex items-center gap-4 text-white">
					<span className="font-mono text-sm tracking-widest tabular-nums">
						{String(index + 1).padStart(2, '0')} <span className="text-white/70">/ {String(slides.length).padStart(2, '0')}</span>
					</span>
					<div className="hidden sm:flex items-center gap-1.5">
						{slides.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => goTo(i)}
								aria-label={`Go to image ${i + 1}`}
								className="py-3 cursor-pointer group"
							>
								<span className={`block h-[3px] rounded-full transition-all duration-500 ${i === index ? 'w-12 bg-[var(--color-forest-400)]' : 'w-6 bg-white/40 group-hover:bg-white/70'}`} />
							</button>
						))}
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => goTo(index - 1)}
							aria-label="Previous image"
							className="flex items-center justify-center size-10 rounded-xl border border-white/40 hover:bg-white hover:text-[var(--color-navy-900)] backdrop-blur-sm transition-colors cursor-pointer"
						>
							<ChevronLeft size={18} />
						</button>
						<button
							type="button"
							onClick={() => goTo(index + 1)}
							aria-label="Next image"
							className="flex items-center justify-center size-10 rounded-xl border border-white/40 hover:bg-white hover:text-[var(--color-navy-900)] backdrop-blur-sm transition-colors cursor-pointer"
						>
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
