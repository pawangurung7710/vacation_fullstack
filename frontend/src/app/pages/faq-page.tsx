import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, MessageCircle, Mail, BookOpen, ArrowRight } from 'lucide-react';
import { ScrollAnimate } from '../components/scroll-animate';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SeoHead } from '../components/SeoHead';
import { faqsApi } from '../services/api';
import { defaultFaqCategories } from '../data/faq-defaults';
import type { FAQCategory } from '../data/faq-defaults';
import { getBaseUrl } from '../config/seo';
import { useBlogPosts } from '../hooks/useBlog';

export function FAQPage() {
	const [activeCategory, setActiveCategory] = useState<number>(0);
	const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
	const [faqsLoading, setFaqsLoading] = useState(true);
	const { posts: blogPosts, loading: blogLoading } = useBlogPosts({ featured: true });

	const blogCategoryLabels: Record<string, string> = {
		destinations: 'Destinations',
		gear: 'Gear & Kit',
		training: 'Training',
		stories: 'Trail Stories',
		safety: 'Safety',
		guides: 'Guide Notes',
	};

	useEffect(() => {
		let isMounted = true;
		const loadFaqs = async () => {
			setFaqsLoading(true);
			try {
				const data = await faqsApi.getAll();
				if (!isMounted) return;
				if (Array.isArray(data) && data.length > 0) {
					const normalized = data
						.map((category: any, index: number) => ({
							title: category.title?.trim() || 'Untitled',
							icon: category.icon || '❓',
							order: category.order ?? index,
							faqs: Array.isArray(category.faqs) ? category.faqs : [],
						}))
						.sort((a: FAQCategory, b: FAQCategory) => (a.order ?? 0) - (b.order ?? 0));
					setFaqCategories(normalized);
				} else {
					setFaqCategories(defaultFaqCategories);
				}
			} catch (error) {
				if (!isMounted) return;
				setFaqCategories(defaultFaqCategories);
			} finally {
				if (isMounted) setFaqsLoading(false);
			}
		};

		loadFaqs();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (faqCategories.length === 0) return;
		if (activeCategory >= faqCategories.length) {
			setActiveCategory(0);
		}
	}, [activeCategory, faqCategories.length]);

	// Filter FAQs based on search
	const getFilteredFAQs = () => {
		if (!searchQuery.trim()) {
			return faqCategories;
		}

		return faqCategories
			.map(category => ({
				...category,
				faqs: category.faqs.filter(
					faq =>
						faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
						faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
				),
			}))
			.filter(category => category.faqs.length > 0);
	};

	const filteredCategories = getFilteredFAQs();

	const baseUrl = getBaseUrl();
	const canonicalUrl = baseUrl ? `${baseUrl}/faq` : undefined;
	const faqJsonLd = useMemo(() => {
		const mainEntity = faqCategories.flatMap(cat =>
			(cat.faqs || []).map(faq => ({
				'@type': 'Question',
				name: faq.question,
				acceptedAnswer: { '@type': 'Answer', text: faq.answer },
			}))
		);
		if (mainEntity.length === 0) return undefined;
		return {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			name: 'FAQ | The Trekkers Squad',
			description: 'Frequently asked questions about The Trekkers Squad trips, booking, safety, gear and travel logistics.',
			url: canonicalUrl,
			mainEntity,
		};
	}, [faqCategories, canonicalUrl]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SeoHead
				title="FAQ | The Trekkers Squad"
				description="Frequently asked questions about The Trekkers Squad trips, booking, safety, gear and travel logistics. Find answers before you travel."
				image="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
				canonicalUrl={canonicalUrl}
				type="website"
				jsonLd={faqJsonLd}
			/>
			{/* Hero Section */}
			<section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900">
				<div className="absolute inset-0">
					<ImageWithFallback
						src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
						alt="Planning adventure with map"
						fetchPriority="high"
						className="w-full h-full object-cover animate-hero-zoom"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
				</div>

				<div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="inline-block glass-card px-6 py-2 rounded-full mb-6 border-2 border-white/30 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
						<span className="text-black/80 text-sm font-medium">Your Questions Answered</span>
					</div>

					<h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '200ms' }}>
						Frequently Asked
						<br />
						<span className="text-[var(--color-navy-300)]">Questions</span>
					</h1>

					<p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '380ms' }}>
						Everything you need to know about planning your adventure with The Trekkers Squad
					</p>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto relative animate-fade-in-up" style={{ animationDelay: '560ms' }}>
						<div className="relative glass-card rounded-full border-2 border-white/30 glow-navy">
							<input
								type="text"
								placeholder="Search questions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-6 py-4 pl-14 bg-black bg-transparent text-slate placeholder-black/80 focus:outline-none rounded-full text-lg"
							/>
							<Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/80" size={24} />
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Categories Pills */}
			<section className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex flex-wrap gap-3">
						{faqCategories.map((category, index) => (
							<button
								key={index}
								onClick={() => {
									setActiveCategory(index);
									setSearchQuery('');
								}}
								className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeCategory === index
										? 'bg-[var(--color-navy-600)] text-white shadow-lg'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
							>
								<span className="text-lg">{category.icon}</span>
								<span className="font-medium">{category.title}</span>
							</button>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Content */}
			<section className="py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{faqsLoading ? (
						<div className="text-center py-16">
							<p className="text-gray-500 text-lg">Loading FAQs...</p>
						</div>
					) : filteredCategories.length === 0 ? (
						<div className="text-center py-16">
							<p className="text-gray-500 text-lg">No questions found matching "{searchQuery}"</p>
							<Button onClick={() => setSearchQuery('')} variant="outline" className="mt-4">
								Clear Search
							</Button>
						</div>
					) : (
						filteredCategories.map((category, catIndex) => {
							const displayCategory = searchQuery ? category : faqCategories[activeCategory];
							if (!searchQuery && catIndex !== activeCategory) return null;

							return (
								<div key={catIndex} className="mb-12">
									{searchQuery && (
										<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
											<span className="text-3xl">{category.icon}</span>
											{category.title}
										</h2>
									)}

									<div className="space-y-4">
										{displayCategory.faqs.map((faq, faqIndex) => {
											const globalIndex = searchQuery ? `${catIndex}-${faqIndex}` : faqIndex.toString();
											const isActive = activeFAQ === (searchQuery ? globalIndex : faqIndex);

											return (
												<ScrollAnimate
													key={globalIndex}
													animation="fade-in-up"
													delay={faqIndex * 50}
												>
													<div className="glass-card rounded-2xl overflow-hidden border-2 border-white/30 hover:border-[var(--color-navy-300)] transition-all duration-300">
														<button
															onClick={() => setActiveFAQ(isActive ? null : (searchQuery ? globalIndex : faqIndex))}
															className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-white/50 transition-colors"
														>
															<h3 className="font-semibold text-lg text-gray-900 flex-1">
																{faq.question}
															</h3>
															<ChevronDown
																size={24}
																className={`flex-shrink-0 text-[var(--color-navy-600)] transition-transform duration-300 ${isActive ? 'rotate-180' : ''
																	}`}
															/>
														</button>

														{isActive && (
															<div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
																<p className="text-gray-700 leading-relaxed">{faq.answer}</p>
															</div>
														)}
													</div>
												</ScrollAnimate>
											);
										})}
									</div>
								</div>
							);
						})
					)}
				</div>
			</section>

			{/* Blog Teaser Carousel - Stories from the Trail */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<ScrollAnimate animation="fade-in-up">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
							<div>
								<h2 className="text-4xl md:text-5xl mb-2 font-semibold">Stories from the Trail</h2>
								<p className="text-gray-600 text-lg">Guides, gear and field notes from the trail</p>
							</div>
							<Link to="/blog">
								<Button variant="outline" className="gap-2 glass-hover">
									Read All Stories
									<BookOpen size={16} />
								</Button>
							</Link>
						</div>
					</ScrollAnimate>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{blogLoading ? (
							Array.from({ length: 3 }).map((_, index) => (
								<Card key={`blog-skeleton-${index}`} className="glass-card overflow-hidden h-full">
									<div className="aspect-[16/9] overflow-hidden relative">
										<Skeleton className="h-full w-full" />
									</div>
									<CardContent className="p-6 space-y-4">
										<Skeleton className="h-5 w-24" />
										<Skeleton className="h-6 w-10/12" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-11/12" />
										<div className="flex items-center justify-between">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-16" />
										</div>
									</CardContent>
								</Card>
							))
						) : blogPosts.length === 0 ? (
							<div className="col-span-3 text-center py-8 text-gray-600">No stories available yet.</div>
						) : (
							blogPosts.slice(0, 3).map((post, index) => (
								<ScrollAnimate key={post.slug || post.id || post._id || index} animation="fade-in-up" delay={index * 100}>
									<Link to={`/blog/${post.slug || post._id}`} className="group block h-full">
										<Card className="glass-card overflow-hidden h-full glass-hover transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
											<div className="aspect-[16/9] overflow-hidden relative">
												<img
													src={post.image || post.featuredImage || ''}
													alt={post.title}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
												/>
												<div className="absolute top-4 left-4">
													<Badge className="glass-light text-white border-white/50">
														{blogCategoryLabels[post.category] || post.category}
													</Badge>
												</div>
											</div>
											<CardContent className="p-6">
												<h3 className="text-xl mb-3 font-semibold group-hover:text-[var(--color-navy-600)] transition-colors">
													{post.title}
												</h3>
												<p className="text-gray-600 text-sm mb-4 leading-relaxed">
													{post.excerpt}
												</p>
												<div className="flex items-center justify-between text-sm text-gray-500">
													<span>{post.readTime || 'Read time TBD'}</span>
													<span className="flex items-center text-[var(--color-navy-600)] font-semibold group-hover:translate-x-1 transition-transform">
														Read More <ArrowRight size={14} className="ml-1" />
													</span>
												</div>
											</CardContent>
										</Card>
									</Link>
								</ScrollAnimate>
							))
						)}
					</div>
				</div>
			</section>

			{/* Still Have Questions CTA */}
			<section className="py-20 bg-gradient-to-br from-[var(--color-forest-600)] to-[var(--color-navy-600)]">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<ScrollAnimate animation="fade-in-up">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
							Still Have Questions?
						</h2>
					</ScrollAnimate>

					<ScrollAnimate animation="fade-in-up" delay={100}>
						<p className="text-xl text-white/90 mb-10 leading-relaxed">
							Our team of adventure experts is here to help you plan the perfect journey
						</p>
					</ScrollAnimate>

					<ScrollAnimate animation="fade-in-up" delay={200}>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Link to="/contact">
								<Button
									size="lg"
									className="bg-white text-[var(--color-forest-600)] hover:bg-gray-100 gap-2 text-lg px-10"
								>
									<Mail size={20} />
									Contact Us
								</Button>
							</Link>
							<a href="https://wa.me/yourwhatsapp" target="_blank" rel="noopener noreferrer">
								<Button
									size="lg"
									variant="outline"
									className="border-2 border-white text-white hover:bg-white/10 gap-2 text-lg px-10"
								>
									<MessageCircle size={20} />
									Chat on WhatsApp
								</Button>
							</a>
						</div>
					</ScrollAnimate>

					<ScrollAnimate animation="fade-in-up" delay={300}>
						<div className="mt-12 pt-8 border-t border-white/20">
							<p className="text-white/80 mb-4">Or explore more about our adventures</p>
							<div className="flex flex-wrap gap-3 justify-center">
								<Link to="/all-trips">
									<Button variant="ghost" className="text-white hover:bg-white/10">
										Browse All Trips
									</Button>
								</Link>
								<Link to="/about">
									<Button variant="ghost" className="text-white hover:bg-white/10">
										About Us
									</Button>
								</Link>
							</div>
						</div>
					</ScrollAnimate>
				</div>
			</section>
		</div>
	);
}
