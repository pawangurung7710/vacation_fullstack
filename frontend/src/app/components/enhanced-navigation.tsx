import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Calendar, MapPin, Mountain, TrendingUp, Filter, Search, MessageCircle, Instagram } from 'lucide-react';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import logoImage from '../../assets/trekkers-logo.png';
import { getCachedNavigationData, preloadNavigationData, type NavCategory, type Region } from '../services/navigation-preload';

interface DropdownItem {
	label: string;
	path: string;
	tagline?: string;
}

interface NavItem {
	label: string;
	path?: string;
	dropdown?: DropdownItem[];
	isSpecial?: boolean;
}

// Kick off fetch as early as possible (module load) so nav items are ready faster.
void preloadNavigationData();

export function EnhancedNavigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
	const [regions, setRegions] = useState<Region[]>(() => getCachedNavigationData()?.regions ?? []);
	const [navCategories, setNavCategories] = useState<NavCategory[]>(() => getCachedNavigationData()?.navCategories ?? []);
	const location = useLocation();
	const navigate = useNavigate();
	const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Static nav items (All Trips, About Us) – category links are built from API
	const staticNavItems: NavItem[] = [
		{
			label: 'All Trips',
			isSpecial: true,
		},
		{
			label: 'About Us',
			dropdown: [
				{ label: 'Our Story', path: '/about', tagline: 'Our journey & philosophy' },
				{ label: 'Careers & Partnerships', path: '/about/careers-partnerships', tagline: 'Join our mission' },
				{ label: 'Blog', path: '/blog', tagline: 'Stories from the trail' },
				{ label: 'FAQ', path: '/faq', tagline: 'Common questions answered' },
			],
		},
	];

	// Dynamic nav: category links or dropdowns from API + static items
	const navItems: NavItem[] = [
		...navCategories
			.slice()
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map((c) => {
				const children = (c.children ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
				if (children.length > 0) {
					return {
						label: c.label,
						dropdown: children.map((child) => ({
							label: child.label,
							path: `/trips/${c.slug}/${child.slug}`,
							tagline: child.tagline,
						})),
					};
				}
				return { label: c.label, path: `/trips/${c.slug}` };
			}),
		...staticNavItems,
	];

	// Trip calendar filter state (for All Trips dropdown)
	const [filterState, setFilterState] = useState({
		dateRange: 'any',
		location: 'all',
		tripType: [] as string[],
		difficulty: 'any',
	});

	// Handle desktop dropdown hover
	const handleMouseEnter = (label: string) => {
		if (dropdownTimeoutRef.current) {
			clearTimeout(dropdownTimeoutRef.current);
		}
		setActiveDropdown(label);
	};

	const handleMouseLeave = (label: string) => {
		if (label === 'All Trips') {
			return;
		}
		dropdownTimeoutRef.current = setTimeout(() => {
			setActiveDropdown(null);
		}, 200);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent, label: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			setActiveDropdown(activeDropdown === label ? null : label);
		} else if (e.key === 'Escape') {
			setActiveDropdown(null);
		}
	};

	// Handle mobile dropdown toggle
	const toggleMobileDropdown = (label: string) => {
		setMobileActiveDropdown(mobileActiveDropdown === label ? null : label);
	};

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			if (target.closest('[data-nav-dropdown]')) return;
			if (target.closest('[data-radix-select-trigger]')) return;
			if (target.closest('[data-radix-select-content]')) return;
			if (target.closest('[data-radix-popper-content-wrapper]')) return;

			setActiveDropdown(null);
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		let isActive = true;
		const loadNavigation = async () => {
			try {
				const data = await preloadNavigationData();
				if (!isActive) return;
				setRegions(data.regions || []);
				setNavCategories(data.navCategories || []);
			} catch (error) {
				if (!isActive) return;
				setRegions([]);
				setNavCategories([]);
			}
		};

		loadNavigation();
		return () => {
			isActive = false;
		};
	}, []);

	// Handle All Trips filter search
	const handleFilterSearch = () => {
		const params = new URLSearchParams();
		const now = new Date();
		if (filterState.dateRange !== 'any') {
			const maxDate = new Date(now);
			if (filterState.dateRange === 'next-month') {
				maxDate.setMonth(maxDate.getMonth() + 1);
			} else if (filterState.dateRange === 'next-3-months') {
				maxDate.setMonth(maxDate.getMonth() + 3);
			} else if (filterState.dateRange === 'next-6-months') {
				maxDate.setMonth(maxDate.getMonth() + 6);
			}
			params.append('minDepartureDate', now.toISOString().slice(0, 10));
			params.append('maxDepartureDate', maxDate.toISOString().slice(0, 10));
		}
		if (filterState.location !== 'all') params.append('region', filterState.location);
		if (filterState.difficulty !== 'any') params.append('difficulty', filterState.difficulty);

		navigate(`/all-trips?${params.toString()}`);
		setActiveDropdown(null);
		setMobileMenuOpen(false);
	};

	const isActive = (path: string) => location.pathname === path;

	return (
		<nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2 z-50 flex-shrink-0">
						<img src={logoImage} alt="Trekkers Squad Logo" width={44} height={44} className="h-11 w-11" />
					</Link>

					{/* Desktop Navigation - Centered with more space */}
					<div className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
						{navItems.map((item) => (
							<div
								key={item.label}
								className="relative"
								onMouseEnter={() => handleMouseEnter(item.label)}
								onMouseLeave={() => handleMouseLeave(item.label)}
							>
								{item.path && !item.dropdown ? (
									<Link
										to={item.path}
										className={`px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 flex items-center gap-1 whitespace-nowrap text-sm ${isActive(item.path) ? 'text-[var(--color-navy-600)]' : 'text-gray-700'
											}`}
									>
										{item.label}
									</Link>
								) : (
									<button
										className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 flex items-center gap-1 text-gray-700 whitespace-nowrap text-sm"
										onClick={(e) => {
											e.stopPropagation();
											setActiveDropdown(activeDropdown === item.label ? null : item.label);
										}}
										onKeyDown={(e) => handleKeyDown(e, item.label)}
										aria-expanded={activeDropdown === item.label}
										aria-controls={`dropdown-${item.label}`}
										aria-haspopup="true"
									>
										{item.label}
										<ChevronDown
											size={16}
											className={`transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''
												}`}
										/>
									</button>
								)}

								{/* Dropdown Menu */}
								{activeDropdown === item.label && (
									<div
										id={`dropdown-${item.label}`}
										className={`absolute top-full mt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-200 ${item.label === 'About Us' ? 'right-0' : 'left-0'
											}`}
										data-nav-dropdown
										onMouseEnter={() => handleMouseEnter(item.label)}
										onMouseLeave={() => handleMouseLeave(item.label)}
										onClick={(event) => event.stopPropagation()}
									>
										<div className="rounded-2xl border border-white/50 bg-white/95 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
											<div className="p-3">
												{item.isSpecial ? (
													// Special "All Trips" dropdown with filters
													<div className="p-4 space-y-4">
														<h3 className="text-base font-semibold text-slate-900">Find Your Perfect Trip</h3>

														{/* Date Range */}
														<div>
															<Label htmlFor="nav-date" className="text-xs mb-1 flex items-center gap-1">
																<Calendar size={12} />
																Date Range
															</Label>
															<Select
																value={filterState.dateRange}
																onValueChange={(value) => setFilterState({ ...filterState, dateRange: value })}
															>
																<SelectTrigger
																	id="nav-date"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="any">Any time</SelectItem>
																	<SelectItem value="next-month">Next month</SelectItem>
																	<SelectItem value="next-3-months">Next 3 months</SelectItem>
																	<SelectItem value="next-6-months">Next 6 months</SelectItem>
																</SelectContent>
															</Select>
														</div>

														{/* Location */}
														<div>
															<Label htmlFor="nav-location" className="text-xs mb-1 flex items-center gap-1">
																<MapPin size={12} />
																Location
															</Label>
															<Select
																value={filterState.location}
																onValueChange={(value) => setFilterState({ ...filterState, location: value })}
															>
																<SelectTrigger
																	id="nav-location"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="all">All locations</SelectItem>
																	{regions.length === 0 ? (
																		<SelectItem value="none" disabled>
																			No regions available
																		</SelectItem>
																	) : (
																		regions.map((region) => (
																			<SelectItem key={region._id} value={region.name}>
																				{region.name}
																			</SelectItem>
																		))
																	)}
																</SelectContent>
															</Select>
														</div>

														{/* Difficulty */}
														<div>
															<Label htmlFor="nav-difficulty" className="text-xs mb-1 flex items-center gap-1">
																<TrendingUp size={12} />
																Difficulty
															</Label>
															<Select
																value={filterState.difficulty}
																onValueChange={(value) => setFilterState({ ...filterState, difficulty: value })}
															>
																<SelectTrigger
																	id="nav-difficulty"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/90 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="any">Any level</SelectItem>
																	<SelectItem value="easy">Easy</SelectItem>
																	<SelectItem value="moderate">Moderate</SelectItem>
																	<SelectItem value="challenging">Challenging</SelectItem>
																	<SelectItem value="expert">Expert</SelectItem>
																</SelectContent>
															</Select>
														</div>

														<Button
															onClick={handleFilterSearch}
															className="w-full gap-2"
															size="sm"
														>
															<Search size={16} />
															Search Trips
														</Button>

														<div className="flex gap-2">
															<Link
																to="/all-trips"
																className="flex-1 text-center text-sm text-[var(--color-navy-600)] hover:underline py-2"
																onClick={() => setActiveDropdown(null)}
															>
																Browse all trips →
															</Link>
															<Link
																to="/trip-comparison"
																className="flex-1 text-center text-sm text-[var(--color-navy-600)] hover:underline py-2"
																onClick={() => setActiveDropdown(null)}
															>
																Compare trips →
															</Link>
														</div>
													</div>
												) : (
													// Regular dropdown menu
													item.dropdown?.map((subItem, index) => (
														<Link
															key={subItem.path}
															to={subItem.path}
															onClick={() => setActiveDropdown(null)}
															className="group block rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:border-[var(--color-navy-100)] hover:bg-[var(--color-navy-50)]"
														>
															<div className="text-sm font-semibold text-slate-900 group-hover:text-[var(--color-navy-700)]">
																{subItem.label}
															</div>
															{subItem.tagline && (
																<div className="mt-0.5 text-[11px] text-slate-500 group-hover:text-[var(--color-navy-600)]">
																	{subItem.tagline}
																</div>
															)}
														</Link>
													))
												)}
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					{/* CTA - Right Side */}
					<div className="hidden lg:flex items-center gap-3">
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									to="/contact"
									aria-label="Contact our trip experts"
									className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 hover:bg-[var(--color-navy-50)] hover:text-[var(--color-navy-600)] transition-colors"
								>
									<MessageCircle size={18} />
								</Link>
							</TooltipTrigger>
							<TooltipContent>Contact our trip experts</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://wa.me/+977-98-0000-0000"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Chat with us on WhatsApp"
									className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
								>
									<WhatsAppIcon size={18} />
								</a>
							</TooltipTrigger>
							<TooltipContent>Chat with us on WhatsApp</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href="https://www.instagram.com/thetrekkerssquad/"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="The Trekkers Squad on Instagram"
									className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
								>
									<Instagram size={18} />
								</a>
							</TooltipTrigger>
							<TooltipContent>The Trekkers Squad on Instagram</TooltipContent>
						</Tooltip>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
						aria-expanded={mobileMenuOpen}
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="lg:hidden absolute inset-x-0 top-full border-t bg-white max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
					<div className="px-4 py-4 space-y-2">
						{navItems.map((item) => (
							<div key={item.label}>
								{item.path && !item.dropdown ? (
									<Link
										to={item.path}
										onClick={() => setMobileMenuOpen(false)}
										className={`block py-3 px-4 rounded-lg transition-colors min-h-[44px] flex items-center ${isActive(item.path)
												? 'bg-[var(--color-navy-100)] text-[var(--color-navy-600)]'
												: 'hover:bg-gray-100'
											}`}
									>
										{item.label}
									</Link>
								) : (
									<>
										<button
											onClick={() => toggleMobileDropdown(item.label)}
											className="w-full text-left py-3 px-4 rounded-lg transition-colors hover:bg-gray-100 flex items-center justify-between min-h-[44px]"
											aria-expanded={mobileActiveDropdown === item.label}
											aria-controls={`mobile-dropdown-${item.label}`}
										>
											<span className="font-medium">{item.label}</span>
											<ChevronDown
												size={18}
												className={`transition-transform duration-300 ${mobileActiveDropdown === item.label ? 'rotate-180' : ''
													}`}
											/>
										</button>

										{/* Mobile Accordion Dropdown */}
										{mobileActiveDropdown === item.label && (
											<div
												id={`mobile-dropdown-${item.label}`}
												className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-300"
											>
												{item.isSpecial ? (
													// Mobile All Trips Filter
													<div className="space-y-4 rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-sm">
														<h4 className="text-sm font-semibold text-slate-900">Find Your Trip</h4>

														<div>
															<Label htmlFor="mobile-date" className="text-xs mb-1">Date Range</Label>
															<Select
																value={filterState.dateRange}
																onValueChange={(value) => setFilterState({ ...filterState, dateRange: value })}
															>
																<SelectTrigger
																	id="mobile-date"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/95 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="any">Any time</SelectItem>
																	<SelectItem value="next-month">Next month</SelectItem>
																	<SelectItem value="next-3-months">Next 3 months</SelectItem>
																	<SelectItem value="next-6-months">Next 6 months</SelectItem>
																</SelectContent>
															</Select>
														</div>

														<div>
															<Label htmlFor="mobile-location" className="text-xs mb-1">Location</Label>
															<Select
																value={filterState.location}
																onValueChange={(value) => setFilterState({ ...filterState, location: value })}
															>
																<SelectTrigger
																	id="mobile-location"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/95 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="all">All locations</SelectItem>
																	{regions.length === 0 ? (
																		<SelectItem value="none" disabled>
																			No regions available
																		</SelectItem>
																	) : (
																		regions.map((region) => (
																			<SelectItem key={region._id} value={region.name}>
																				{region.name}
																			</SelectItem>
																		))
																	)}
																</SelectContent>
															</Select>
														</div>

														<div>
															<Label htmlFor="mobile-difficulty" className="text-xs mb-1">Difficulty</Label>
															<Select
																value={filterState.difficulty}
																onValueChange={(value) => setFilterState({ ...filterState, difficulty: value })}
															>
																<SelectTrigger
																	id="mobile-difficulty"
																	data-radix-select-trigger
																	className="h-10 rounded-xl border-slate-200/70 bg-white/95 text-sm text-slate-700 shadow-sm focus-visible:ring-[var(--color-navy-500)]"
																>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent
																	data-radix-select-content
																	className="rounded-xl border border-slate-200/80 bg-white shadow-lg"
																>
																	<SelectItem value="any">Any level</SelectItem>
																	<SelectItem value="easy">Easy</SelectItem>
																	<SelectItem value="moderate">Moderate</SelectItem>
																	<SelectItem value="challenging">Challenging</SelectItem>
																	<SelectItem value="expert">Expert</SelectItem>
																</SelectContent>
															</Select>
														</div>

														<Button onClick={handleFilterSearch} className="w-full" size="sm">
															Search Trips
														</Button>

														<div className="flex gap-2">
															<Link
																to="/all-trips"
																className="flex-1 text-center text-sm text-[var(--color-navy-600)] hover:underline"
																onClick={() => setMobileMenuOpen(false)}
															>
																Browse all trips →
															</Link>
															<Link
																to="/trip-comparison"
																className="flex-1 text-center text-sm text-[var(--color-navy-600)] hover:underline"
																onClick={() => setMobileMenuOpen(false)}
															>
																Compare trips →
															</Link>
														</div>
													</div>
												) : (
													item.dropdown?.map((subItem) => (
														<Link
															key={subItem.path}
															to={subItem.path}
															onClick={() => setMobileMenuOpen(false)}
															className="block py-3 px-4 rounded-lg hover:bg-[var(--color-navy-100)] transition-colors min-h-[44px]"
														>
															<div className="font-medium text-sm">{subItem.label}</div>
															{subItem.tagline && (
																<div className="text-xs text-gray-600 mt-0.5">{subItem.tagline}</div>
															)}
														</Link>
													))
												)}
											</div>
										)}
									</>
								)}
							</div>
						))}

						{/* Mobile CTA */}
						<div className="pt-4 border-t mt-4 space-y-3">
							<Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
								<Button variant="outline" className="w-full min-h-[44px] gap-2">
									<MessageCircle size={18} />
									Contact Experts
								</Button>
							</Link>
							<div className="flex items-center justify-center gap-4">
								<a
									href="https://wa.me/+977-98-0000-0000"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Chat with us on WhatsApp"
									className="flex items-center justify-center w-11 h-11 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
								>
									<WhatsAppIcon size={20} />
								</a>
								<a
									href="https://www.instagram.com/thetrekkerssquad/"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="The Trekkers Squad on Instagram"
									className="flex items-center justify-center w-11 h-11 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
								>
									<Instagram size={20} />
								</a>
							</div>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
