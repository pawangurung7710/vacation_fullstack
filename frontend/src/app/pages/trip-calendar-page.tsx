import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Users, X, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/breadcrumbs';
import { ScrollAnimate } from '../components/scroll-animate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { regionsApi } from '../services/api';
import { useTrips, Trip } from '../hooks/useTrips';
import { resolveMediaUrl } from '../services/api';

export function TripCalendarPage() {
  // Filter states
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [regionOptions, setRegionOptions] = useState<Array<{ _id: string; name: string }>>([]);

  // Fetch trips from API
  const { trips: allTrips, loading: tripsLoading, error: tripsError } = useTrips({
    status: 'published',
  });

  const getTripDepartureDate = (trip: Trip) => {
    if (trip.nextDepartureDate) return trip.nextDepartureDate;
    if (trip.departures && trip.departures.length > 0) {
      // Find the next upcoming departure
      const now = new Date();
      const upcomingDepartures = trip.departures
        .filter((dep: any) => {
          const depDate = new Date(dep.startDate);
          return depDate >= now && dep.status !== 'cancelled';
        })
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return upcomingDepartures.length > 0 ? upcomingDepartures[0].startDate : trip.departures[0]?.startDate;
    }
    return null;
  };

  // Filter trips that have departure dates
  const scheduledTrips = allTrips.filter(trip => getTripDepartureDate(trip));

  // Get unique regions from trips
  const regions = Array.from(new Set(scheduledTrips.map(trip => trip.region).filter(Boolean)));

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

  // Date range options
  const getDateRangeFilter = (dateRange: string, departureDate: string) => {
    if (dateRange === 'all') return true;
    
    const date = new Date(departureDate);
    const now = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    switch (dateRange) {
      case 'next-month':
        return date.getMonth() === now.getMonth() + 1 && date.getFullYear() === now.getFullYear();
      case 'next-3-months':
        return date >= now && date <= threeMonths;
      case 'next-6-months':
        return date >= now && date <= sixMonths;
      default:
        return true;
    }
  };

  const filteredTrips = scheduledTrips.filter(trip => {
    const tripDepartureDate = getTripDepartureDate(trip);
    const matchesDateRange = tripDepartureDate ? getDateRangeFilter(dateRange, tripDepartureDate) : true;
    const matchesRegion = selectedRegion === 'all' || trip.region === selectedRegion;
    const matchesCategory = selectedCategory === 'all' || 
      trip.categorySlug === selectedCategory || 
      trip.categoryLabel?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDifficulty = selectedDifficulty === 'all' || trip.difficulty === selectedDifficulty;

    return matchesDateRange && matchesRegion && matchesCategory && matchesDifficulty;
  });

  const resetFilters = () => {
    setDateRange('all');
    setSelectedRegion('all');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const hasActiveFilters = dateRange !== 'all' || selectedRegion !== 'all' || 
                          selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
			src="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1600&q=80"
            alt="Trip Calendar"
            className="w-full h-full object-cover animate-hero-zoom"
            fetchPriority="high"
          />
          <div className="absolute inset-0" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumbs
              items={[{ label: 'Trip Calendar' }]}
              className="mb-8 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            />
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl mb-6 text-white glass-text-contrast-heavy animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Trip Calendar
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 glass-text-contrast leading-relaxed animate-fade-in-up" style={{ animationDelay: '380ms' }}>
                Browse upcoming departures and plan your mountain adventure
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <Card className="p-6 mb-8 border-slate-200/70 bg-white/95 shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <Label htmlFor="date-range" className="mb-2 block text-sm">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-slate-200/70 bg-white/90">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="next-month">Next month</SelectItem>
                  <SelectItem value="next-3-months">Next 3 months</SelectItem>
                  <SelectItem value="next-6-months">Next 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="mb-2 block text-sm">Location</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="border-slate-200/70 bg-white/90">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {(regionOptions.length > 0 ? regionOptions.map((region) => region.name) : regions).map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trip Type */}
            <div>
              <Label htmlFor="trip-type" className="mb-2 block text-sm">Trip Type</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-slate-200/70 bg-white/90">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="adventures">Adventures</SelectItem>
                  <SelectItem value="experiences">Experiences</SelectItem>
                  <SelectItem value="retreats">Retreats</SelectItem>
                  <SelectItem value="short-activities">Short Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="difficulty" className="mb-2 block text-sm">Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as typeof selectedDifficulty)}>
                <SelectTrigger className="border-slate-200/70 bg-white/90">
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredTrips.length} of {scheduledTrips.length} scheduled trips
            </p>
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  <X size={16} />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {tripsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <CardContent className="p-6">
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
                          <div className="h-8 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="h-9 w-24 bg-gray-200 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tripsError ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <X className="text-red-400" size={40} />
                </div>
                <h3 className="text-2xl mb-3">Error loading trips</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {tripsError.message || 'Failed to load trips. Please try again later.'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrips.map((trip, index) => {
                  const tripId = trip.slug || trip.id || trip._id;
                  const tripImage = resolveMediaUrl(trip.image || trip.featuredImage || '');
                  const departureDate = getTripDepartureDate(trip);

                  return (
                    <ScrollAnimate key={tripId} animation="fade-in-up" delay={index * 100}>
                    <Link
                      to={`/trip/${tripId}`}
                      className="group block"
                    >
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        {/* Image with Date Ribbon */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                          {tripImage && (
                            <img
                              src={tripImage}
                              alt={trip.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                          {/* Date Ribbon */}
                          {departureDate && (
                            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-center min-w-[64px]">
                              <div className="text-xs font-semibold text-[var(--color-navy-600)] uppercase">
                                {new Date(departureDate).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              <div className="text-2xl font-bold text-[var(--color-ink-900)]">
                                {new Date(departureDate).getDate()}
                              </div>
                            </div>
                          )}
                          {/* Region Tag */}
                          {trip.region && (
                            <div className="absolute bottom-4 left-4">
                              <Badge variant="category" className="bg-white/90 backdrop-blur-sm">
                                <MapPin size={14} className="mr-1" />
                                {trip.region}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6">
                          <h3 className="text-xl mb-2 group-hover:text-[var(--color-navy-600)] transition-colors">
                            {trip.title}
                          </h3>
                          
                          {/* One-line description */}
                          {trip.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {trip.description}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                            {trip.duration && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{trip.duration}</span>
                              </div>
                            )}
                            {trip.maxGroupSize && (
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>Max {trip.maxGroupSize}</span>
                              </div>
                            )}
                          </div>

                          {/* Price & CTA */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <div className="text-xs text-gray-600">From</div>
                              <div className="text-2xl font-semibold">US ${trip.price}</div>
                            </div>
                            <Button size="sm" className="group-hover:shadow-md transition-shadow">
                              View Trip
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    </ScrollAnimate>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="text-gray-500" size={40} />
                </div>
                <h3 className="text-2xl mb-3">No trips found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {scheduledTrips.length === 0 
                    ? 'No trips with scheduled departures are available at the moment.'
                    : 'Try adjusting your filters or browse all available trips'}
                </p>
                <div className="flex gap-4 justify-center">
                  {hasActiveFilters && (
                    <Button onClick={resetFilters} variant="outline">
                      Reset Filters
                    </Button>
                  )}
                  <Link to="/all-trips">
                    <Button>
                      View All Trips
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
