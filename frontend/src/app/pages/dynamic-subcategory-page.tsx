import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge, SustainabilityBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, MapPin, Users, Clock, TrendingUp, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { countriesApi, regionsApi, tripsApi, categoriesApi } from '../services/api';
import { resolveMediaUrl } from '../services/api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { TripCard } from '../components/trip-card';
import { Skeleton } from '../components/ui/skeleton';

const coreSustainabilityBadges = new Set([
  'zerowaste',
  'lowcarbon',
  'localhire',
  'inclusivegrowth',
]);
const normalizeBadgeLabel = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '');

export function DynamicSubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  
  const [subcategoryData, setSubcategoryData] = useState<any | null>(null);
  const [categoryData, setCategoryData] = useState<any | null>(null);
  const [notFoundType, setNotFoundType] = useState<'category' | 'subcategory' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    difficulty: '',
    minDuration: '',
    maxDuration: '',
    minPrice: '',
    maxPrice: '',
    minDate: '',
    maxDate: '',
    featured: 'all',
    sort: 'createdAt',
    order: 'desc',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regionOptions, setRegionOptions] = useState<Array<{ _id: string; name: string }>>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ _id: string; name: string }>>([]);

  const [trips, setTrips] = useState<any[]>([]);
  const [loadedHeroSrc, setLoadedHeroSrc] = useState<string | null>(null);

  // Fetch category and subcategory data to validate and get dynamic content
  useEffect(() => {
    const loadCategoryAndSubcategory = async () => {
      setNotFoundType(null);
      
      let matchedCategory: any = null;
      
      // First validate category exists
      if (categorySlug) {
        try {
          const categories = await categoriesApi.getAll({ level: 0, isActive: true });
          matchedCategory = categories.find((cat: any) => cat.slug === categorySlug);
          
          if (!matchedCategory) {
            setNotFoundType('category');
            setCategoryData(null);
            return;
          }
          
          setCategoryData(matchedCategory);
        } catch (error) {
          console.error('Error loading category:', error);
          setNotFoundType('category');
          return;
        }
      }
      
      // Then validate subcategory exists AND belongs to the category
      if (subcategorySlug && matchedCategory) {
        try {
          // Fetch level 1 categories (subcategories)
          const subcategories = await categoriesApi.getAll({ level: 1, isActive: true });
          
          const matched = subcategories.find((sub: any) => {
            // Check if slug matches
            if (sub.slug !== subcategorySlug) return false;
            
            // Check if parent matches the category
            const parentId = typeof sub.parent === 'object' && sub.parent?._id 
              ? sub.parent._id 
              : sub.parent;
            
            // Match by parent ID or parent slug
            return parentId === matchedCategory._id || 
                   (sub.parent?.slug === matchedCategory.slug);
          });
          
          if (!matched) {
            setNotFoundType('subcategory');
            setSubcategoryData(null);
            return;
          }
          
          setSubcategoryData(matched);
        } catch (error) {
          console.error('Error loading subcategory:', error);
          setNotFoundType('subcategory');
        }
      }
    };
    
    loadCategoryAndSubcategory();
  }, [categorySlug, subcategorySlug]);

  // Gates the hero image/heading specifically: stays false (skeleton) until the
  // real subcategory data has been fetched, so the generic placeholder hero
  // image never flashes on screen before swapping to the real one.
  const heroReady = !!subcategoryData;

  const pageTitle = subcategoryData?.label || subcategoryData?.name || 'Trips';
  const pageDescription = subcategoryData?.description || subcategoryData?.tagline || 'Explore our curated experiences';
  const heroImage = resolveMediaUrl(subcategoryData?.heroImage || subcategoryData?.imageUrl || 'https://images.unsplash.com/photo-1571401847270-78ab5f316800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920', { width: 1920, height: 900, crop: 'c_fill' });

  useEffect(() => {
    // Only preload once we know the real (fetched) hero image - preloading the
    // generic placeholder would just waste bandwidth on an image that's never
    // actually rendered.
    if (!heroReady || !heroImage) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImage;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [heroReady, heroImage]);

  // Transform API trips to match the component's expected format
  const transformedTrips = useMemo(() => {
    return trips.map((trip) => {
      let difficulty = trip.difficulty;
      if (difficulty === 'expert') {
        difficulty = 'strenuous';
      }
      const departureDate = trip.nextDepartureDate || trip.departureDate || trip.departures?.[0]?.startDate;
      
      return {
        id: trip.id || trip._id || '',
        title: trip.title,
        duration: trip.duration,
        difficulty: difficulty as 'easy' | 'moderate' | 'challenging' | 'strenuous',
        location: trip.region || trip.location || '',
        price: `US $${trip.price}`,
        groupSize: `Max ${trip.maxGroupSize}`,
        nextDeparture: departureDate
          ? new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : trip.season || 'Year-round',
        image: trip.image || trip.featuredImage || heroImage,
        badges: trip.sustainabilityBadges || [],
        description: trip.description,
      };
    });
  }, [trips, heroImage]);

  const [filteredTrips, setFilteredTrips] = useState(transformedTrips);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const result = await tripsApi.getAllWithMeta({
        categorySlug: categorySlug || undefined,
        subcategorySlug: subcategorySlug || undefined,
        search: appliedSearch || undefined,
        country: filters.country || undefined,
        region: filters.region || undefined,
        difficulty: filters.difficulty || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minDuration: filters.minDuration || undefined,
        maxDuration: filters.maxDuration || undefined,
        minDepartureDate: filters.minDate || undefined,
        maxDepartureDate: filters.maxDate || undefined,
        featured: filters.featured === 'all' ? undefined : filters.featured === 'featured',
        sort: filters.sort,
        order: filters.order,
        page,
        limit: 9,
      });
      setTrips(result.data || []);
      const pagination = result.meta?.pagination;
      setTotalPages(pagination?.pages || 1);
      setTotalTrips(pagination?.total || 0);
    } catch (error) {
      setTrips([]);
      setTotalPages(1);
      setTotalTrips(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [
    categorySlug,
    subcategorySlug,
    appliedSearch,
    filters.country,
    filters.region,
    filters.difficulty,
    filters.minPrice,
    filters.maxPrice,
    filters.minDuration,
    filters.maxDuration,
    filters.minDate,
    filters.maxDate,
    filters.featured,
    filters.sort,
    filters.order,
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
    setFilteredTrips(transformedTrips);
  }, [transformedTrips]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      region: '',
      difficulty: '',
      minDuration: '',
      maxDuration: '',
      minPrice: '',
      maxPrice: '',
      minDate: '',
      maxDate: '',
      featured: 'all',
      sort: 'createdAt',
      order: 'desc',
    });
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      case 'challenging':
        return 'bg-orange-100 text-orange-800';
      case 'strenuous':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show error message if category or subcategory not found
  if (notFoundType === 'category') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            No category with slug "{categorySlug}" was found.
          </p>
          <a
            href="/all-trips"
            className="inline-block px-6 py-3 bg-[var(--color-forest-600)] text-white rounded-lg hover:bg-[var(--color-forest-700)] transition-colors"
          >
            Browse All Trips
          </a>
        </div>
      </div>
    );
  }

  if (notFoundType === 'subcategory') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subcategory Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            No subcategory with slug "{subcategorySlug}" was found in the "{categorySlug}" category.
          </p>
          <a
            href={`/trips/${categorySlug}`}
            className="inline-block px-6 py-3 bg-[var(--color-forest-600)] text-white rounded-lg hover:bg-[var(--color-forest-700)] transition-colors mr-4"
          >
            Back to {categoryData?.label || 'Category'}
          </a>
          <a
            href="/all-trips"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse All Trips
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-navy-50)]">
      {/* Hero Section */}
      <div className="relative h-[55vh] min-h-[460px] overflow-hidden bg-gray-900">
        {heroReady ? (
          <>
            <img
              src={heroImage}
              alt={pageTitle}
              className={`w-full h-full object-cover transition-opacity duration-500 ${loadedHeroSrc === heroImage ? 'opacity-100' : 'opacity-0'}`}
              fetchPriority="high"
              onLoad={() => setLoadedHeroSrc(heroImage)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-400)] mb-3 font-medium">Trips</p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-4 !text-white font-semibold leading-[1.05] max-w-3xl">
                  {pageTitle}
                </h1>
                <p className="text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed">
                  {pageDescription}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0" aria-hidden>
            <Skeleton className="absolute inset-0 rounded-none bg-white/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Skeleton className="h-9 sm:h-14 w-3/4 max-w-md bg-white/15" />
              <Skeleton className="h-5 w-1/2 max-w-sm bg-white/15" />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter Toggle Button (Mobile) */}
        <div className="mb-8 lg:hidden">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="w-full gap-2"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="border-0 bg-white shadow-md rounded-3xl lg:sticky lg:top-24">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filter Trips</h3>
                  {(filters.country ||
                    filters.region ||
                    filters.difficulty ||
                    filters.minDuration ||
                    filters.maxDuration ||
                    filters.minPrice ||
                    filters.maxPrice ||
                    filters.minDate ||
                    filters.maxDate ||
                    filters.featured !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[var(--color-navy-600)] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    Country
                  </Label>
                  <Select
                    value={filters.country || 'all'}
                    onValueChange={(value) => handleFilterChange('country', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any country</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country._id} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    Region
                  </Label>
                  <Select
                    value={filters.region || 'all'}
                    onValueChange={(value) => handleFilterChange('region', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="Any region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any region</SelectItem>
                      {regionOptions.map((region) => (
                        <SelectItem key={region._id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <TrendingUp size={14} />
                    Difficulty
                  </Label>
                  <Select
                    value={filters.difficulty || 'all'}
                    onValueChange={(value) => handleFilterChange('difficulty', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Clock size={14} />
                    Duration (days)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Min"
                      value={filters.minDuration}
                      onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={filters.maxDuration}
                      onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    Departure window
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.minDate}
                      onChange={(e) => handleFilterChange('minDate', e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="date"
                      value={filters.maxDate}
                      onChange={(e) => handleFilterChange('maxDate', e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Price range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="border-slate-200/70"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="border-slate-200/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Featured</Label>
                  <Select
                    value={filters.featured}
                    onValueChange={(value) => handleFilterChange('featured', value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="All trips" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All trips</SelectItem>
                      <SelectItem value="featured">Featured only</SelectItem>
                      <SelectItem value="not-featured">Not featured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Sort by</Label>
                  <Select
                    value={filters.sort}
                    onValueChange={(value) => handleFilterChange('sort', value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="Created date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest</SelectItem>
                      <SelectItem value="updatedAt">Recently updated</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Order</Label>
                  <Select
                    value={filters.order}
                    onValueChange={(value) => handleFilterChange('order', value)}
                  >
                    <SelectTrigger className="border-slate-200/70">
                      <SelectValue placeholder="Descending" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trip Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {totalTrips} {totalTrips === 1 ? 'Trip' : 'Trips'} Found
              </h2>
              <p className="text-gray-600">
                Explore our carefully curated experiences
              </p>
            </div>

            <div className="mb-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category-search" className="text-sm text-gray-600">
                  Search trips
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      id="category-search"
                      type="text"
                      placeholder="Search by title or description..."
                      className="pl-10 rounded-full h-11 bg-white"
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
                    size="sm"
                    className="px-5 h-10"
                    onClick={() => {
                      setAppliedSearch(searchInput.trim());
                      setPage(1);
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Trip Cards - same layout and card style as /all-trips (fully clickable card) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={`trip-skeleton-${index}`} className="h-[500px] flex flex-col overflow-hidden">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id || trip._id}
                    trip={{
                      id: trip.id || trip._id,
                      _id: trip._id,
                      title: trip.title,
                      slug: trip.slug,
                      image: trip.image,
                      featuredImage: trip.featuredImage,
                      description: trip.description || '',
                      heroSubtitle: trip.heroSubtitle,
                      region: trip.region || trip.location || '',
                      duration: trip.duration,
                      difficulty: (trip.difficulty === 'strenuous' ? 'expert' : trip.difficulty) as 'easy' | 'moderate' | 'challenging' | 'expert',
                      maxGroupSize: trip.maxGroupSize ?? 0,
                      sustainabilityBadges: trip.sustainabilityBadges,
                      price: typeof trip.price === 'number' ? trip.price : Number(String(trip.price).replace(/[^0-9.]/g, '')) || 0,
                    }}
                  />
                ))}
              </div>
            )}

            {!loading && filteredTrips.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600 mb-4">
                  No trips found matching your filters.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
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
      </div>
    </div>
  );
}
