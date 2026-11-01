import {
	ChevronDown,
	Briefcase,
	Handshake,
	Users,
	Globe,
	Heart,
	Mountain,
	TrendingUp,
	Sparkles,
	Mail,
	MapPin,
	ArrowRight,
	CheckCircle2,
	Building2,
	type LucideIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { ScrollAnimate } from '../../components/scroll-animate';
import { ParallaxImage } from '../../components/parallax';
import { SeoHead } from '../../components/SeoHead';
import { useEffect, useRef, useState } from 'react';
import { getBaseUrl } from '../../config/seo';
import careersPartnershipsPageContent from '../../data/careers-partnerships-page.json';
import { pagesApi } from '../../services/api';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '../../components/ui/dialog';
import { ContactForm } from '../../components/contact-form';
import { CONTACT_REASONS } from '../../components/contact-form';

type IconKey = 'Briefcase' | 'Handshake' | 'Users' | 'Globe' | 'Heart' | 'Mountain' | 'TrendingUp' | 'Sparkles' | 'Building2';

type JobType = 'Full-time' | 'Part-time' | 'Seasonal' | 'Contract';

type CareersPartnershipsPageContent = {
	hero: {
		image: { src: string; alt: string };
		overlayClassName: string;
		breadcrumbs: Array<{ label: string; path?: string }>;
		title: string;
		subtitle: string;
	};
	sections: {
		whyJoin: {
			title: string;
			subtitle: string;
			benefits: Array<{ icon: IconKey; title: string; description: string }>;
		};
		openPositions: {
			badge: { icon: IconKey; text: string };
			title: string;
			subtitle: string;
			labels: {
				aboutRole: string;
				requirements: string;
				responsibilities: string;
				benefits: string;
				applyCta: string;
				shareCta: string;
			};
			jobs: Array<{
				id: string;
				title: string;
				department: string;
				location: string;
				type: JobType;
				description: string;
				requirements: string[];
				responsibilities: string[];
				benefits: string[];
			}>;
			generalApplication: { title: string; description: string; cta: string };
		};
		partnerships: {
			badge: { icon: IconKey; text: string };
			title: string;
			subtitle: string;
			labels: {
				description: string;
				lookingFor: string;
				benefits: string;
				cta: string;
			};
			opportunities: Array<{
				id: string;
				icon: IconKey;
				title: string;
				category: string;
				description: string;
				lookingFor: string[];
				benefits: string[];
			}>;
		};
	};
	cta: {
		backgroundImage: { src: string; alt: string };
		overlayClassName: string;
		title: string;
		description: string;
		actions: Array<{ icon: IconKey; label: string; href: string }>;
	};
	mail: {
		careersEmail: string;
		partnershipsEmail: string;
		jobApplicationSubjectPrefix: string;
		generalApplicationHref: string;
		partnershipSubjectPrefix: string;
	};
};

const ICONS: Record<IconKey, LucideIcon> = {
	Briefcase,
	Handshake,
	Users,
	Globe,
	Heart,
	Mountain,
	TrendingUp,
	Sparkles,
	Building2,
};

function getIcon(name: string): LucideIcon {
	return ICONS[name as IconKey] ?? Sparkles;
}

const defaultContent = careersPartnershipsPageContent as CareersPartnershipsPageContent;

function mergeWithDefaults(candidate: any): CareersPartnershipsPageContent {
	const merged: CareersPartnershipsPageContent = {
		...defaultContent,
		...candidate,
		hero: {
			...defaultContent.hero,
			...(candidate?.hero ?? {}),
			image: {
				...defaultContent.hero.image,
				...(candidate?.hero?.image ?? {}),
			},
		},
		sections: {
			...defaultContent.sections,
			...(candidate?.sections ?? {}),
			whyJoin: {
				...defaultContent.sections.whyJoin,
				...(candidate?.sections?.whyJoin ?? {}),
			},
			openPositions: {
				...defaultContent.sections.openPositions,
				...(candidate?.sections?.openPositions ?? {}),
				badge: {
					...defaultContent.sections.openPositions.badge,
					...(candidate?.sections?.openPositions?.badge ?? {}),
				},
				labels: {
					...defaultContent.sections.openPositions.labels,
					...(candidate?.sections?.openPositions?.labels ?? {}),
				},
				generalApplication: {
					...defaultContent.sections.openPositions.generalApplication,
					...(candidate?.sections?.openPositions?.generalApplication ?? {}),
				},
				jobs: Array.isArray(candidate?.sections?.openPositions?.jobs)
					? candidate.sections.openPositions.jobs
					: defaultContent.sections.openPositions.jobs,
			},
			partnerships: {
				...defaultContent.sections.partnerships,
				...(candidate?.sections?.partnerships ?? {}),
				badge: {
					...defaultContent.sections.partnerships.badge,
					...(candidate?.sections?.partnerships?.badge ?? {}),
				},
				labels: {
					...defaultContent.sections.partnerships.labels,
					...(candidate?.sections?.partnerships?.labels ?? {}),
				},
				opportunities: Array.isArray(candidate?.sections?.partnerships?.opportunities)
					? candidate.sections.partnerships.opportunities
					: defaultContent.sections.partnerships.opportunities,
			},
		},
		cta: {
			...defaultContent.cta,
			...(candidate?.cta ?? {}),
			backgroundImage: {
				...defaultContent.cta.backgroundImage,
				...(candidate?.cta?.backgroundImage ?? {}),
			},
			actions: Array.isArray(candidate?.cta?.actions) ? candidate.cta.actions : defaultContent.cta.actions,
		},
		mail: {
			...defaultContent.mail,
			...(candidate?.mail ?? {}),
		},
	};

	return merged;
}

const REASON_OPEN_POSITIONS = 'Open Positions Enquiry';
const REASON_PARTNERSHIP = 'Partnership Opportunity';

export function CareersPartnershipsPage() {
	const [selectedJob, setSelectedJob] = useState<string | null>(null);
	const [activePartnership, setActivePartnership] = useState<string | null>(null);
	const [pageContent, setPageContent] = useState<CareersPartnershipsPageContent>(defaultContent);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [contactModalReason, setContactModalReason] = useState<string>('');
	const jobCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const partnershipCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const { hero, sections, cta, mail } = pageContent;

	const openContactModal = (reason: string) => {
		setContactModalReason(CONTACT_REASONS.includes(reason as any) ? reason : '');
		setContactModalOpen(true);
	};
	const OpenPositionsBadgeIcon = getIcon(sections.openPositions.badge.icon);
	const PartnershipsBadgeIcon = getIcon(sections.partnerships.badge.icon);

	const toggleJob = (jobId: string) => {
		setSelectedJob(selectedJob === jobId ? null : jobId);
	};

	const togglePartnership = (partnershipId: string) => {
		setActivePartnership(activePartnership === partnershipId ? null : partnershipId);
	};

	// Scroll opened accordion into view so its top is visible
	useEffect(() => {
		if (!selectedJob) return;
		const el = jobCardRefs.current[selectedJob];
		if (el) {
			const id = requestAnimationFrame(() => {
				el.scrollIntoView({ block: 'start', behavior: 'smooth' });
			});
			return () => cancelAnimationFrame(id);
		}
	}, [selectedJob]);

	useEffect(() => {
		if (!activePartnership) return;
		const el = partnershipCardRefs.current[activePartnership];
		if (el) {
			const id = requestAnimationFrame(() => {
				el.scrollIntoView({ block: 'start', behavior: 'smooth' });
			});
			return () => cancelAnimationFrame(id);
		}
	}, [activePartnership]);

	useEffect(() => {
		let isActive = true;

		const loadFromApi = async () => {
			try {
				const page = await pagesApi.getByKey('careers-partnerships');
				const raw = typeof page?.content === 'string' ? page.content : null;
				if (!raw) return;
				const parsed = JSON.parse(raw);
				const merged = mergeWithDefaults(parsed);
				if (isActive) setPageContent(merged);
			} catch {
				// Fall back to defaults
			}
		};

		loadFromApi();
		return () => {
			isActive = false;
		};
	}, []);

	const baseUrl = getBaseUrl();
	const canonicalUrl = baseUrl ? `${baseUrl}/about/careers-partnerships` : undefined;
	const careersJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Careers & Partnerships | The Trekkers Squad',
		description: 'Join The Trekkers Squad or partner with us. Careers in sustainable tourism, open positions, and partnership opportunities for responsible travel in the mountains.',
		url: canonicalUrl,
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<SeoHead
				title="Careers & Partnerships | The Trekkers Squad"
				description="Join The Trekkers Squad or partner with us. Careers in sustainable tourism, open positions, and partnership opportunities for responsible travel in the mountains."
				image={hero.image.src}
				canonicalUrl={canonicalUrl}
				type="website"
				jsonLd={careersJsonLd}
			/>
			{/* Hero Section */}
			<section className="relative h-[70vh] min-h-[600px] overflow-hidden bg-gray-900">
				<ParallaxImage
					src={hero.image.src}
					alt={hero.image.alt}
					speed={0.3}
					className="absolute inset-0 animate-hero-zoom"
					overlayClassName={hero.overlayClassName}
				/>

				<div className="relative z-10 h-full flex items-center">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
						<Breadcrumbs
							items={hero.breadcrumbs}
							className="mb-8 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60"
						/>
						<div className="max-w-3xl">
							<h1 className="text-5xl sm:text-6xl md:text-7xl mb-6 text-white glass-text-contrast-heavy animate-fade-in-up" style={{ animationDelay: '200ms' }}>
								{hero.title}
							</h1>
							<p className="text-xl sm:text-2xl text-white/95 glass-text-contrast leading-relaxed animate-fade-in-up" style={{ animationDelay: '380ms' }}>
								{hero.subtitle}
							</p>
						</div>
					</div>
				</div>
			</section>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
				{/* Why Join Trekkers Squad */}
				<section>
					<ScrollAnimate animation="fade-in-up">
						<div className="text-center mb-12">
							<h2 className="text-4xl md:text-5xl mb-4 font-semibold">{sections.whyJoin.title}</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								{sections.whyJoin.subtitle}
							</p>
						</div>
					</ScrollAnimate>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{sections.whyJoin.benefits.map((benefit, index) => {
							const Icon = getIcon(benefit.icon);
							return (
								<ScrollAnimate key={benefit.title} animation="fade-in-up" delay={index * 50}>
								<Card className="glass-card h-full hover:-translate-y-1 transition-all duration-300">
									<CardContent className="p-6">
										<div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-navy-600)] to-[var(--color-forest-600)] flex items-center justify-center mb-4">
											<Icon size={28} className="text-white" />
										</div>
										<h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
										<p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
									</CardContent>
								</Card>
							</ScrollAnimate>
							);
						})}
					</div>
				</section>

				{/* Open Positions */}
				<section>
					<ScrollAnimate animation="fade-in-up">
						<div className="text-center mb-12">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-navy-100)] to-[var(--color-forest-100)] mb-6">
								<OpenPositionsBadgeIcon className="text-[var(--color-navy-600)]" size={20} />
								<span className="font-semibold text-[var(--color-navy-700)]">{sections.openPositions.badge.text}</span>
							</div>
							<h2 className="text-4xl md:text-5xl mb-4 font-semibold">{sections.openPositions.title}</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								{sections.openPositions.subtitle}
							</p>
						</div>
					</ScrollAnimate>

					<div className="space-y-6">
						{sections.openPositions.jobs.map((job, index) => (
							<ScrollAnimate key={job.id} animation="fade-in-up" delay={index * 100}>
								<div ref={(el) => { jobCardRefs.current[job.id] = el; }} className="scroll-mt-24">
									<Card className="glass-card overflow-hidden">
										<button
											onClick={() => toggleJob(job.id)}
										className="w-full text-left"
									>
										<CardHeader className="hover:bg-gray-50 transition-colors">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1">
													<CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
													<div className="flex flex-wrap gap-2">
														<Badge className="bg-[var(--color-navy-100)] text-[var(--color-navy-700)]">
															<Briefcase size={12} className="mr-1" />
															{job.department}
														</Badge>
														<Badge className="bg-[var(--color-forest-100)] text-[var(--color-forest-700)]">
															<MapPin size={12} className="mr-1" />
															{job.location}
														</Badge>
														<Badge variant="outline">{job.type}</Badge>
													</div>
												</div>
												<ChevronDown
													size={28}
													className={`text-gray-600 transition-transform duration-300 ${selectedJob === job.id ? 'rotate-180' : ''}`}
												/>
											</div>
										</CardHeader>
									</button>

									{selectedJob === job.id && (
										<CardContent className="pt-0 pb-6 animate-in slide-in-from-top-4 duration-300">
											<div className="space-y-6">
												<div>
													<h4 className="font-semibold text-lg mb-2">{sections.openPositions.labels.aboutRole}</h4>
													<p className="text-gray-700 leading-relaxed">{job.description}</p>
												</div>

												<div>
													<h4 className="font-semibold text-lg mb-3">{sections.openPositions.labels.requirements}</h4>
													<ul className="space-y-2">
														{job.requirements.map((req, idx) => (
															<li key={idx} className="flex items-start gap-2">
																<CheckCircle2 size={16} className="text-[var(--color-forest-600)] flex-shrink-0 mt-0.5" />
																<span className="text-gray-700 text-sm">{req}</span>
															</li>
														))}
													</ul>
												</div>

												<div>
													<h4 className="font-semibold text-lg mb-3">{sections.openPositions.labels.responsibilities}</h4>
													<ul className="space-y-2">
														{job.responsibilities.map((resp, idx) => (
															<li key={idx} className="flex items-start gap-2">
																<CheckCircle2 size={16} className="text-[var(--color-navy-600)] flex-shrink-0 mt-0.5" />
																<span className="text-gray-700 text-sm">{resp}</span>
															</li>
														))}
													</ul>
												</div>

												<div>
													<h4 className="font-semibold text-lg mb-3">{sections.openPositions.labels.benefits}</h4>
													<ul className="space-y-2">
														{job.benefits.map((benefit, idx) => (
															<li key={idx} className="flex items-start gap-2">
																<CheckCircle2 size={16} className="text-[var(--color-sun-600)] flex-shrink-0 mt-0.5" />
																<span className="text-gray-700 text-sm">{benefit}</span>
															</li>
														))}
													</ul>
												</div>

												<div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
													<Button
														onClick={() => openContactModal(REASON_OPEN_POSITIONS)}
														className="flex-1 w-full bg-gradient-to-r from-[var(--color-navy-600)] to-[var(--color-forest-600)] hover:from-[var(--color-navy-700)] hover:to-[var(--color-forest-700)]"
													>
														<Mail size={18} className="mr-2" />
														{sections.openPositions.labels.applyCta}
													</Button>
													<Button variant="outline" className="flex-1">
														{sections.openPositions.labels.shareCta}
														<ArrowRight size={16} className="ml-2" />
													</Button>
												</div>
											</div>
										</CardContent>
									)}
									</Card>
								</div>
							</ScrollAnimate>
						))}
					</div>

					<ScrollAnimate animation="fade-in-up" delay={300}>
						<Card className="glass-card mt-8 bg-gradient-to-br from-[var(--color-navy-50)] to-white border-2 border-[var(--color-navy-200)]">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">{sections.openPositions.generalApplication.title}</h3>
								<p className="text-gray-700 mb-6 max-w-2xl mx-auto">
									{sections.openPositions.generalApplication.description}
								</p>
								<Button
									size="lg"
									variant="outline"
									className="gap-2"
									onClick={() => openContactModal(REASON_OPEN_POSITIONS)}
								>
									<Mail size={18} />
									{sections.openPositions.generalApplication.cta}
								</Button>
							</CardContent>
						</Card>
					</ScrollAnimate>
				</section>

				{/* Partnership Opportunities */}
				<section>
					<ScrollAnimate animation="fade-in-up">
						<div className="text-center mb-12">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-forest-100)] to-[var(--color-sun-100)] mb-6">
								<PartnershipsBadgeIcon className="text-[var(--color-forest-600)]" size={20} />
								<span className="font-semibold text-[var(--color-forest-700)]">{sections.partnerships.badge.text}</span>
							</div>
							<h2 className="text-4xl md:text-5xl mb-4 font-semibold">{sections.partnerships.title}</h2>
							<p className="text-xl text-gray-600 max-w-3xl mx-auto">
								{sections.partnerships.subtitle}
							</p>
						</div>
					</ScrollAnimate>

					<div className="space-y-6">
						{sections.partnerships.opportunities.map((partnership, index) => {
							const PartnershipIcon = getIcon(partnership.icon);
							return (
								<ScrollAnimate key={partnership.id} animation="fade-in-up" delay={index * 100}>
								<div ref={(el) => { partnershipCardRefs.current[partnership.id] = el; }} className="scroll-mt-24">
									<Card className="glass-card overflow-hidden">
										<button
											onClick={() => togglePartnership(partnership.id)}
										className="w-full text-left"
									>
										<CardHeader className="hover:bg-gray-50 transition-colors">
											<div className="flex items-start justify-between gap-4">
												<div className="flex items-start gap-4 flex-1">
													<div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-forest-600)] to-[var(--color-navy-600)] flex items-center justify-center flex-shrink-0">
														<PartnershipIcon size={28} className="text-white" />
													</div>
													<div className="flex-1">
														<CardTitle className="text-2xl mb-2">{partnership.title}</CardTitle>
														<Badge className="bg-[var(--color-sun-100)] text-[var(--color-sun-700)]">
															{partnership.category}
														</Badge>
													</div>
												</div>
												<ChevronDown
													size={28}
													className={`text-gray-600 transition-transform duration-300 ${activePartnership === partnership.id ? 'rotate-180' : ''}`}
												/>
											</div>
										</CardHeader>
									</button>

									{activePartnership === partnership.id && (
										<CardContent className="pt-0 pb-6 animate-in slide-in-from-top-4 duration-300">
											<div className="space-y-6">
												<div>
													<h4 className="font-semibold text-lg mb-2">{sections.partnerships.labels.description}</h4>
													<p className="text-gray-700 leading-relaxed">{partnership.description}</p>
												</div>

												<div>
													<h4 className="font-semibold text-lg mb-3">{sections.partnerships.labels.lookingFor}</h4>
													<ul className="space-y-2">
														{partnership.lookingFor.map((item, idx) => (
															<li key={idx} className="flex items-start gap-2">
																<CheckCircle2 size={16} className="text-[var(--color-forest-600)] flex-shrink-0 mt-0.5" />
																<span className="text-gray-700 text-sm">{item}</span>
															</li>
														))}
													</ul>
												</div>

												<div>
													<h4 className="font-semibold text-lg mb-3">{sections.partnerships.labels.benefits}</h4>
													<ul className="space-y-2">
														{partnership.benefits.map((benefit, idx) => (
															<li key={idx} className="flex items-start gap-2">
																<CheckCircle2 size={16} className="text-[var(--color-navy-600)] flex-shrink-0 mt-0.5" />
																<span className="text-gray-700 text-sm">{benefit}</span>
															</li>
														))}
													</ul>
												</div>

												<div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
													<Button
														onClick={() => openContactModal(REASON_PARTNERSHIP)}
														className="flex-1 w-full bg-gradient-to-r from-[var(--color-forest-600)] to-[var(--color-navy-600)] hover:from-[var(--color-forest-700)] hover:to-[var(--color-navy-700)]"
													>
														<Mail size={18} className="mr-2" />
														{sections.partnerships.labels.cta}
													</Button>
												</div>
											</div>
										</CardContent>
									)}
									</Card>
								</div>
							</ScrollAnimate>
							);
						})}
					</div>
				</section>
			</div>

			{/* CTA Section (match homepage design) */}
			<section className="py-24 relative overflow-hidden bg-gradient-to-br from-[var(--color-forest-700)] via-[var(--color-forest-600)] to-[var(--color-navy-600)]">
				<ParallaxImage
					src={cta.backgroundImage.src}
					alt={cta.backgroundImage.alt}
					speed={0.3}
					className="absolute inset-0 opacity-30"
					overlayClassName={cta.overlayClassName}
				/>

				<div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<ScrollAnimate animation="fade-in-up">
						<div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-2xl border border-white/20">
							<h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-gray-900 font-semibold">
								{cta.title}
							</h2>
							<p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
								{cta.description}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								{cta.actions.map((action, idx) => {
									const ActionIcon = getIcon(action.icon);
									const isOutline = idx === 0;
									const isCareers = action.label.toLowerCase().includes('careers') || action.href?.toLowerCase().includes('careers');
									const reason = isCareers ? REASON_OPEN_POSITIONS : REASON_PARTNERSHIP;
									return (
										<Button
											key={action.href}
											size="lg"
											onClick={() => openContactModal(reason)}
											className={
												isOutline
													? 'text-lg px-10 bg-white text-[var(--color-forest-600)] hover:bg-gray-50 shadow-xl min-h-[56px] border-2 border-[var(--color-forest-600)]'
													: 'text-lg px-10 bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] text-white shadow-xl min-h-[56px]'
											}
										>
											<ActionIcon size={20} className="mr-2" />
											{action.label}
										</Button>
									);
								})}
							</div>
						</div>
					</ScrollAnimate>
				</div>
			</section>

			{/* Contact form modal (same form as /contact, with reason pre-selected) */}
			<Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
				<DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
					<DialogHeader className="space-y-1 pb-2">
						<DialogTitle className="text-lg">Get in touch</DialogTitle>
						<DialogDescription className="text-sm">
							Send us a message and we&apos;ll get back to you within 24 hours.
						</DialogDescription>
					</DialogHeader>
					<ContactForm
						defaultReason={contactModalReason}
						onSuccess={() => setContactModalOpen(false)}
						compact
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
