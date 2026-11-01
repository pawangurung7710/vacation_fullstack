import { useEffect, useMemo, useRef, useState } from 'react';
import { TripCard } from '../components/trip-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { Search, SlidersHorizontal, ArrowUpDown, X, Star, Calendar, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { categoriesApi, countriesApi, regionsApi, tripsApi } from '../services/api';
import { Link, useLocation } from 'react-router-dom';

type SortOption = 'createdAt' | 'updatedAt' | 'price' | 'duration';

export function AllTripsPage() {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [minDuration, setMinDuration] = useState<string>('');
  const [maxDuration, setMaxDuration] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minDepartureDate, setMinDepartureDate] = useState<string>('');
  const [maxDepartureDate, setMaxDepartureDate] = useState<string>('');
  const [featured, setFeatured] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [topCategories, setTopCategories] = useState<Array<{ _id: string; label: string; slug: string; order?: number }>>([]);

  useEffect(() => {
    categoriesApi
      .getAll({ level: 0, isActive: true })
      .then((data) => Array.isArray(data) && setTopCategories([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))))
      .catch(() => {});
  }, []);
  const [regionOptions, setRegionOptions] = useState<Array<{ _id: string; name: string }>>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ _id: string; name: string }>>([]);

  // Fetch all trips from API
  const [trips, setTrips] = useState<any[]>([]);
  const fetchRequestId = useRef(0);

  const getTripDepartureDate = (trip: any) =>
    trip.nextDepartureDate || trip.departureDate || trip.departures?.[0]?.startDate;

  // Featured Trips and Leaving This Month are sitewide discovery sections,
  // shown below the main results — fetched once, independent of the
  // search/filter state, so they never get narrowed down (or clobbered by a
  // slower unfiltered response) when the user searches or filters above.
  const [featuredTrips, setFeaturedTrips] = useState<any[]>([]);
  const [tripsThisMonth, setTripsThisMonth] = useState<any[]>([]);
  const leavingScrollRef = useRef<HTMLDivElement>(null);
  const [leavingCanScrollLeft, setLeavingCanScrollLeft] = useState(false);
  const [leavingCanScrollRight, setLeavingCanScrollRight] = useState(false);

  const updateLeavingScrollState = () => {
    const el = leavingScrollRef.current;
    if (!el) return;
    setLeavingCanScrollLeft(el.scrollLeft > 4);
    setLeavingCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateLeavingScrollState();
  }, [tripsThisMonth]);

  const scrollLeavingBy = (direction: 1 | -1) => {
    const el = leavingScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  // Featured Trips carousel — mirrors the homepage's Featured Journeys row
  // (same card variant, same desktop disable-at-ends / mobile infinite arrows).
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [featuredCanScrollLeft, setFeaturedCanScrollLeft] = useState(false);
  const [featuredCanScrollRight, setFeaturedCanScrollRight] = useState(false);

  const updateFeaturedScrollState = () => {
    const el = featuredScrollRef.current;
    if (!el) return;
    setFeaturedCanScrollLeft(el.scrollLeft > 4);
    setFeaturedCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateFeaturedScrollState();
  }, [featuredTrips]);

  const scrollFeaturedBy = (direction: 1 | -1) => {
    const el = featuredScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const scrollFeaturedInfinite = (direction: 1 | -1) => {
    const el = featuredScrollRef.current;
    if (!el) return;
    if (direction === 1 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    if (direction === -1 && el.scrollLeft <= 4) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      return;
    }
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      try {
        const [featuredData, monthData] = await Promise.all([
          tripsApi.getAll({ featured: true, sort: 'createdAt', order: 'desc', limit: 3 }),
          tripsApi.getAll({
            minDepartureDate: monthStart,
            maxDepartureDate: monthEnd,
            sort: 'createdAt',
            order: 'desc',
            limit: 10,
          }),
        ]);
        if (cancelled) return;
        setFeaturedTrips(Array.isArray(featuredData) ? featuredData : []);
        const sortedMonth = (Array.isArray(monthData) ? monthData : []).slice().sort((a, b) => {
          const dateA = new Date(getTripDepartureDate(a) || 0).getTime();
          const dateB = new Date(getTripDepartureDate(b) || 0).getTime();
          return dateA - dateB;
        });
        setTripsThisMonth(sortedMonth);
      } catch {
        if (!cancelled) {
          setFeaturedTrips([]);
          setTripsThisMonth([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Duration options based on actual trip data
  const durations = useMemo(() => {
    const uniqueDurations = Array.from(new Set(trips.map(trip => trip.duration))).filter(Boolean);
    return uniqueDurations.sort();
  }, [trips]);

  const filteredAndSortedTrips = useMemo(() => trips, [trips]);

  const resetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedDifficulty('all');
    setSelectedRegion('');
    setSelectedCountry('');
    setMinDuration('');
    setMaxDuration('');
    setMinPrice('');
    setMaxPrice('');
    setMinDepartureDate('');
    setMaxDepartureDate('');
    setFeatured('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const fetchTrips = async () => {
    const requestId = ++fetchRequestId.current;
    setLoading(true);
    try {
      const result = await tripsApi.getAllWithMeta({
        search: appliedSearch || undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        region: selectedRegion || undefined,
        country: selectedCountry || undefined,
        minDuration: minDuration || undefined,
        maxDuration: maxDuration || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minDepartureDate: minDepartureDate || undefined,
        maxDepartureDate: maxDepartureDate || undefined,
        featured: featured === 'all' ? undefined : featured === 'featured',
        sort: sortBy,
        order: sortOrder,
        page,
        limit: 12,
      });
      // Filters can change fast enough that an earlier request's response
      // arrives after a later one's — ignore anything but the latest.
      if (requestId !== fetchRequestId.current) return;
      setTrips(result.data || []);
      const pagination = result.meta?.pagination;
      setTotalPages(pagination?.pages || 1);
      setTotalTrips(pagination?.total || 0);
    } catch (error) {
      if (requestId !== fetchRequestId.current) return;
      setTrips([]);
      setTotalPages(1);
      setTotalTrips(0);
    } finally {
      if (requestId === fetchRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [
    appliedSearch,
    selectedDifficulty,
    selectedRegion,
    selectedCountry,
    minDuration,
    maxDuration,
    minPrice,
    maxPrice,
    minDepartureDate,
    maxDepartureDate,
    featured,
    sortBy,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    let isActive = true;
    const loadRegions = async () => {
      try {
        const data = await regionsApi.getAll({ isActive: true });
        if (isActive) {
          setRegionOptions(data || []);
        }
      } catch (error) {
        if (isActive) {
          setRegionOptions([]);
        }
      }
    };

    loadRegions();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const loadCountries = async () => {
      try {
        const data = await countriesApi.getAll({ isActive: true });
        if (isActive) {
          setCountryOptions(data || []);
        }
      } catch (error) {
        if (isActive) {
          setCountryOptions([]);
        }
      }
    };

    loadCountries();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const querySearch = params.get('search') || '';
    const queryRegion = params.get('region') || '';
    const queryCountry = params.get('country') || '';
    const queryDifficulty = params.get('difficulty') || 'all';
    const queryMinDuration = params.get('minDuration') || '';
    const queryMaxDuration = params.get('maxDuration') || '';
    const queryMinPrice = params.get('minPrice') || '';
    const queryMaxPrice = params.get('maxPrice') || '';
    const queryMinDate = params.get('minDepartureDate') || '';
    const queryMaxDate = params.get('maxDepartureDate') || '';
    const queryFeatured = params.get('featured') || 'all';
    const querySort = (params.get('sort') as SortOption) || 'createdAt';
    const queryOrder = (params.get('order') as 'asc' | 'desc') || 'desc';
    const queryPage = parseInt(params.get('page') || '1', 10);

    setSearchInput(querySearch);
    setAppliedSearch(querySearch);
    setSelectedRegion(queryRegion);
    setSelectedCountry(queryCountry);
    setSelectedDifficulty(queryDifficulty);
    setMinDuration(queryMinDuration);
    setMaxDuration(queryMaxDuration);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
    setMinDepartureDate(queryMinDate);
    setMaxDepartureDate(queryMaxDate);
    setFeatured(queryFeatured);
    setSortBy(querySort);
    setSortOrder(queryOrder);
    setPage(Number.isNaN(queryPage) ? 1 : queryPage);
  }, [location.search]);

  const featuredTripsSection = featuredTrips.length > 0 && (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Star className="text-[var(--color-sun-600)]" size={24} />
        <h2 className="text-3xl font-semibold">Featured Trips</h2>
      </div>
      <div className="relative">
        {/* Desktop / tablet: disable at the ends */}
        <button
          type="button"
          onClick={() => scrollFeaturedBy(-1)}
          disabled={!featuredCanScrollLeft}
          aria-label="Scroll left"
          className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => scrollFeaturedBy(1)}
          disabled={!featuredCanScrollRight}
          aria-label="Scroll right"
          className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Mobile only: infinite (wraparound) */}
        <button
          type="button"
          onClick={() => scrollFeaturedInfinite(-1)}
          aria-label="Scroll left"
          className="flex md:hidden items-center justify-center absolute -left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollFeaturedInfinite(1)}
          aria-label="Scroll right"
          className="flex md:hidden items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>

        <div
          ref={featuredScrollRef}
          onScroll={updateFeaturedScrollState}
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
        >
          {featuredTrips.map((trip) => (
            <div key={trip.id} className="shrink-0 w-full sm:w-[300px] snap-center sm:snap-start">
              <TripCard trip={trip} variant="compact" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const leavingThisMonthSection = tripsThisMonth.length > 0 && (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-[var(--color-navy-600)]" size={24} />
        <h2 className="text-3xl font-semibold">Leaving This Month</h2>
      </div>
      <div className="relative w-screen max-w-none mx-[calc(50%-50vw)] px-6 sm:px-12 lg:px-20">
        {leavingCanScrollLeft && (
          <button
            type="button"
            onClick={() => scrollLeavingBy(-1)}
            aria-label="Scroll left"
            className="hidden sm:flex items-center justify-center absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {leavingCanScrollRight && (
          <button
            type="button"
            onClick={() => scrollLeavingBy(1)}
            aria-label="Scroll right"
            className="hidden sm:flex items-center justify-center absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        )}
        <div
          ref={leavingScrollRef}
          onScroll={updateLeavingScrollState}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scroll-px-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {tripsThisMonth.map((trip) => (
            <div key={trip.id} className="relative flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <TripCard trip={trip} />
              <div className="absolute top-3 right-3 z-10">
                <div className="glass-light rounded-full px-3 py-1 text-xs font-semibold text-white glass-text-contrast">
                  {getTripDepartureDate(trip)
                    ? new Date(getTripDepartureDate(trip)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const activeFilterChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (appliedSearch) activeFilterChips.push({ key: 'search', label: `“${appliedSearch}”`, clear: () => { setSearchInput(''); setAppliedSearch(''); setPage(1); } });
  if (selectedRegion) activeFilterChips.push({ key: 'region', label: selectedRegion, clear: () => setSelectedRegion('') });
  if (selectedCountry) activeFilterChips.push({ key: 'country', label: selectedCountry, clear: () => setSelectedCountry('') });
  if (selectedDifficulty !== 'all') activeFilterChips.push({ key: 'difficulty', label: `Difficulty: ${selectedDifficulty}`, clear: () => setSelectedDifficulty('all') });
  if (minDuration || maxDuration) activeFilterChips.push({ key: 'duration', label: `${minDuration || 1}–${maxDuration || '∞'} days`, clear: () => { setMinDuration(''); setMaxDuration(''); } });
  if (minPrice || maxPrice) activeFilterChips.push({ key: 'price', label: `$${minPrice || 0}–${maxPrice ? '$' + maxPrice : '∞'}`, clear: () => { setMinPrice(''); setMaxPrice(''); } });
  if (featured !== 'all') activeFilterChips.push({ key: 'featured', label: featured === 'featured' ? 'Featured only' : 'Not featured', clear: () => setFeatured('all') });

  return (
    <div className="min-h-screen bg-[var(--color-navy-50)] overflow-x-hidden">
      {/* Banner with search */}
      <section className="relative bg-[var(--color-navy-900)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-navy-900)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-400)] mb-3 font-medium">All trips</p>
          <h1 className="text-4xl md:text-6xl font-semibold !text-white mb-4 leading-tight">Find your next adventure</h1>
          <p className="text-white/70 max-w-xl mb-8">
            {totalTrips} {totalTrips === 1 ? 'trip' : 'trips'} across the mountains. Filter by region, length, difficulty and price.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <input
                id="trip-search"
                type="text"
                placeholder="Search by title or description..."
                className="w-full h-12 pl-11 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/70 outline-none focus:ring-2 focus:ring-[var(--color-forest-400)]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setAppliedSearch(searchInput.trim());
                    setPage(1);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              size="lg"
              className="px-8 bg-[var(--color-forest-500)] hover:bg-[var(--color-forest-600)]"
              onClick={() => {
                setAppliedSearch(searchInput.trim());
                setPage(1);
              }}
            >
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Filters */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="w-full sm:w-auto sm:min-w-[220px] mb-0 flex items-center justify-between gap-6 rounded-full border-[var(--color-navy-200)] bg-white"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filters{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ''}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
              />
            </Button>
            <Card className={`p-6 md:p-8 mt-4 rounded-3xl border-0 bg-white shadow-md ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  <h2 className="text-xl">Filters</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                {/* Region */}
                <div>
                  <Label htmlFor="region" className="mb-2 block">Region</Label>
                  <Select value={selectedRegion || 'all'} onValueChange={(value) => setSelectedRegion(value === 'all' ? '' : value)}>
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regionOptions.map((region) => (
                        <SelectItem key={region._id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country" className="mb-2 block">Country</Label>
                  <Select value={selectedCountry || 'all'} onValueChange={(value) => setSelectedCountry(value === 'all' ? '' : value)}>
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country._id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <Label htmlFor="duration" className="mb-2 block">Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Min"
                      value={minDuration}
                      onChange={(e) => setMinDuration(e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <Label htmlFor="difficulty" className="mb-2 block">Difficulty</Label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value) => setSelectedDifficulty(value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Price Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Departure Window</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={minDepartureDate}
                      onChange={(e) => setMinDepartureDate(e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="date"
                      value={maxDepartureDate}
                      onChange={(e) => setMaxDepartureDate(e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Featured</Label>
                  <Select value={featured} onValueChange={(value) => setFeatured(value)}>
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="All Trips" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trips</SelectItem>
                      <SelectItem value="featured">Featured Only</SelectItem>
                      <SelectItem value="not-featured">Not Featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Showing {filteredAndSortedTrips.length} of {totalTrips} trips
                </p>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div>
            {/* Category chips */}
            {topCategories.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2" aria-label="Browse by category">
                {topCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/trips/${cat.slug}`}
                    className="rounded-full border border-[var(--color-navy-200)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-navy-800)] hover:border-[var(--color-forest-600)] hover:text-[var(--color-forest-700)] transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Active filters */}
            {activeFilterChips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-700">Active filters:</span>
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-100)] text-[var(--color-forest-900)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-forest-200)] cursor-pointer"
                  >
                    {chip.label}
                    <X size={14} aria-hidden />
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
                <button type="button" onClick={resetFilters} className="text-sm font-medium text-[var(--color-navy-800)] underline underline-offset-2 hover:text-black cursor-pointer">
                  Clear all
                </button>
              </div>
            )}

            {/* Sort Bar */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-semibold">
                {totalTrips} {totalTrips === 1 ? 'trip' : 'trips'} found
              </h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-full border border-[var(--color-navy-200)] bg-white p-1" role="group" aria-label="Layout">
                  <button type="button" onClick={() => setViewLayout('grid')} aria-pressed={viewLayout === 'grid'} aria-label="Grid view" className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${viewLayout === 'grid' ? 'bg-[var(--color-navy-900)] text-white' : 'text-[var(--color-navy-700)] hover:bg-[var(--color-navy-50)]'}`}>
                    <LayoutGrid size={16} />
                  </button>
                  <button type="button" onClick={() => setViewLayout('list')} aria-pressed={viewLayout === 'list'} aria-label="List view" className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${viewLayout === 'list' ? 'bg-[var(--color-navy-900)] text-white' : 'text-[var(--color-navy-700)] hover:bg-[var(--color-navy-50)]'}`}>
                    <List size={16} />
                  </button>
                </div>
                <ArrowUpDown size={18} className="text-gray-700" />
                <Label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="border-slate-200/70 min-w-[180px]">
                    <SelectValue placeholder="Newest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Newest</SelectItem>
                    <SelectItem value="updatedAt">Recently updated</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                  <SelectTrigger className="border-slate-200/70 min-w-[160px]">
                    <SelectValue placeholder="Descending" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trip Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={`loading-${idx}`} className="h-[500px] flex flex-col overflow-hidden">
                    <div className="h-60 shrink-0 bg-gray-200 animate-pulse" />
                    <div className="p-4 flex-1 space-y-3 animate-pulse">
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-3 w-full bg-gray-200 rounded" />
                      <div className="h-3 w-5/6 bg-gray-200 rounded" />
                      <div className="h-9 w-full bg-gray-200 rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedTrips.length > 0 ? (
              <div className={viewLayout === 'list' ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'}>
                {filteredAndSortedTrips.map((trip) => (
                  <TripCard key={trip.id || trip._id} trip={trip} layout={viewLayout} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="p-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl mb-2">No trips found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your filters to see more results, or explore our featured categories.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={resetFilters}>Reset Filters</Button>
                  <Button variant="outline" asChild>
                    <a href="/trips/adventures">View Treks</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/trips/experiences">View Experiences</a>
                  </Button>
                </div>
              </Card>
            )}

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page === 1 ? 'pointer-events-none text-gray-500' : 'cursor-pointer'}
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
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className={page === totalPages ? 'pointer-events-none text-gray-500' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          {featuredTripsSection}
          {leavingThisMonthSection}
        </div>
      </div>
    </div>
  );
}
