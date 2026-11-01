import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Check, Minus, ArrowRight, MapPin, Calendar, Users, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge, SustainabilityBadge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Breadcrumbs } from '../components/breadcrumbs';
import { ParallaxImage } from '../components/parallax';
import { ScrollAnimate } from '../components/scroll-animate';
import { resolveMediaUrl, tripsApi } from '../services/api';

type Trip = {
  id: string;
  slug?: string;
  title: string;
  region: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  maxGroupSize: number;
  price: number;
  category: string;
  image: string;
  description: string;
  sustainabilityBadges?: string[];
};

export function TripComparisonPage() {
  const [selectedTrips, setSelectedTrips] = useState<(Trip | null)[]>([null, null, null]);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const coreSustainabilityBadges = useMemo(
    () =>
      new Set([
        'zerowaste',
        'lowcarbon',
        'localhire',
        'inclusivegrowth',
      ]),
    []
  );
  const normalizeBadgeLabel = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '');

  const addTrip = (trip: Trip, index: number) => {
    const newSelected = [...selectedTrips];
    newSelected[index] = trip;
    setSelectedTrips(newSelected);
  };

  const removeTrip = (index: number) => {
    const newSelected = [...selectedTrips];
    newSelected[index] = null;
    setSelectedTrips(newSelected);
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    challenging: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  useEffect(() => {
    let isActive = true;
    const loadTrips = async () => {
      setLoading(true);
      try {
        const data = await tripsApi.getAll({ status: 'published', limit: 50 });
        if (!isActive) return;
        const normalized = (data || []).map((trip: any) => ({
          id: trip.id || trip._id,
          slug: trip.slug,
          title: trip.title,
          region: trip.region || trip.regionLabel || '',
          duration: trip.duration,
          difficulty: trip.difficulty,
          maxGroupSize: trip.maxGroupSize,
          price: trip.price,
          category: trip.categoryLabel || trip.category?.label || '',
          image: resolveMediaUrl(trip.image),
          description: trip.description,
          sustainabilityBadges: trip.sustainabilityBadges || [],
        }));
        setTrips(normalized);
      } catch (error) {
        if (isActive) {
          setTrips([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadTrips();
    return () => {
      isActive = false;
    };
  }, []);

  // Comparison attributes
  const comparisonRows = [
    { label: 'Region', key: 'region' as keyof Trip, icon: MapPin },
    { label: 'Duration', key: 'duration' as keyof Trip, icon: Calendar },
    { label: 'Difficulty', key: 'difficulty' as keyof Trip, icon: TrendingUp },
    { label: 'Max Group Size', key: 'maxGroupSize' as keyof Trip, icon: Users },
    { label: 'Price (USD)', key: 'price' as keyof Trip, icon: DollarSign },
    { label: 'Category', key: 'category' as keyof Trip, icon: MapPin },
  ];

  // Check if a row has differences
  const hasDifferences = (key: keyof Trip) => {
    const values = selectedTrips
      .filter(t => t !== null)
      .map((trip) => {
        const value = trip![key];
        if (Array.isArray(value)) {
          return value.join('|');
        }
        return value ?? '';
      });
    return new Set(values).size > 1;
  };

  const visibleRows = useMemo(() => {
    if (!showDifferencesOnly) return comparisonRows;
    return comparisonRows.filter((row) => hasDifferences(row.key));
  }, [comparisonRows, showDifferencesOnly, selectedTrips]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
					  src="https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1600&q=80"
            alt="Compare Trips"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumbs 
              items={[{ label: 'Compare Trips' }]} 
              className="mb-8 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60"
            />
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl mb-6 text-white glass-text-contrast-heavy">
                Compare Trips
              </h1>
              <p className="text-xl sm:text-2xl text-white/95 glass-text-contrast leading-relaxed">
                Select up to 3 trips to compare side-by-side and find your perfect adventure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trip Selection Cards - Desktop */}
          <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
            {selectedTrips.map((trip, index) => (
              <ScrollAnimate key={index} animation="fade-in-up" delay={index * 100}>
                {trip ? (
                  <div className="glass-card rounded-2xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <button
                        onClick={() => removeTrip(index)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                        aria-label="Remove trip"
                      >
                        <X size={20} />
                      </button>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className={`${difficultyColors[trip.difficulty]} mb-2`}>
                          {trip.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 bg-white/95 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">{trip.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>{trip.duration}</span>
                        <span className="font-bold text-[var(--color-forest-600)]">US ${trip.price}</span>
                      </div>
                      <Link to={`/trip/${trip.slug || trip.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 hover:border-[var(--color-navy-600)] transition-colors">
                    <Plus size={48} className="text-gray-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-600">Select Trip {index + 1}</h3>
                    <p className="text-sm text-gray-500 mb-6 text-center">
                      Choose from available trips below
                    </p>
                  </div>
                )}
              </ScrollAnimate>
            ))}
          </div>

          {/* Trip Selection Cards - Mobile (Stacked) */}
          <div className="md:hidden space-y-6 mb-8">
            {selectedTrips.map((trip, index) => (
              <ScrollAnimate key={index} animation="fade-in-up" delay={index * 100}>
                {trip ? (
                  <Card className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={trip.image}
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 line-clamp-1">{trip.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">US ${trip.price}</p>
                        <Badge className={`${difficultyColors[trip.difficulty]} text-xs`}>
                          {trip.difficulty}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeTrip(index)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Plus size={32} className="text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Select Trip {index + 1}</p>
                    </div>
                  </Card>
                )}
              </ScrollAnimate>
            ))}
          </div>

          {/* Comparison Table */}
          {selectedTrips.some(t => t !== null) && (
            <ScrollAnimate animation="fade-in-up">
              <div className="glass-card rounded-3xl p-6 md:p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-semibold">Detailed Comparison</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                    className="gap-2"
                  >
                    {showDifferencesOnly ? <Check size={16} /> : <Minus size={16} />}
                    {showDifferencesOnly ? 'Show All' : 'Differences Only'}
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-1/4" />
                      <col className="w-1/4" />
                      <col className="w-1/4" />
                      <col className="w-1/4" />
                    </colgroup>
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        {selectedTrips.map((trip, index) => (
                          <th key={index} className="text-left p-4 font-semibold">
                            Trip {index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => {
                        const Icon = row.icon;

                        return (
                          <tr
                            key={row.label}
                            className={`border-b border-gray-100 hover:bg-white/50 transition-colors ${
                              hasDifferences(row.key) ? 'bg-yellow-50/30' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-gray-600" />
                                <span className="font-medium text-gray-800">{row.label}</span>
                              </div>
                            </td>
                            {selectedTrips.map((trip, index) => (
                              <td key={index} className="p-4">
                                {trip ? (
                                  <div>
                                    {row.key === 'difficulty' ? (
                                      <Badge className={difficultyColors[trip[row.key] as keyof typeof difficultyColors]}>
                                        {String(trip[row.key])}
                                      </Badge>
                                    ) : row.key === 'price' ? (
                                      <span className="font-bold text-[var(--color-forest-600)]">
                                        ${trip[row.key]}
                                      </span>
                                    ) : (
                                      <span className="text-gray-700">{String(trip[row.key])}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* Sustainability Badges Row */}
                      {(!showDifferencesOnly || hasDifferences('sustainabilityBadges')) && (
                        <tr className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Leaf size={16} className="text-green-600" />
                              <span className="font-medium text-gray-800">Sustainability</span>
                            </div>
                          </td>
                          {selectedTrips.map((trip, index) => (
                            <td key={index} className="p-4">
                              {trip ? (
                                <div className="flex flex-wrap gap-1">
                                  {trip.sustainabilityBadges?.slice(0, 2).map((badge) => (
                                    coreSustainabilityBadges.has(normalizeBadgeLabel(badge)) ? (
                                      <SustainabilityBadge
                                        key={badge}
                                        label={badge}
                                        size="sm"
                                        className="w-fit"
                                      />
                                    ) : (
                                      <SustainabilityBadge
                                        key={badge}
                                        label={badge}
                                        size="sm"
                                        icon={<Leaf size={12} />}
                                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                                      />
                                    )
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      )}

                      {/* Description Row */}
                      {(!showDifferencesOnly || hasDifferences('description')) && (
                        <tr className="hover:bg-white/50 transition-colors">
                          <td className="p-4 font-medium text-gray-800">Description</td>
                          {selectedTrips.map((trip, index) => (
                            <td key={index} className="p-4">
                              {trip ? (
                                <p className="text-sm text-gray-700 line-clamp-3">{trip.description}</p>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollAnimate>
          )}

          {/* Available Trips to Select */}
          <ScrollAnimate animation="fade-in-up">
            <div className="glass-card rounded-3xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">Available Trips</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`trip-skeleton-${idx}`} className="glass-card rounded-xl overflow-hidden">
                      <div className="aspect-video bg-gray-200 animate-pulse" />
                      <div className="p-4 space-y-3 animate-pulse">
                        <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                        <div className="h-9 w-full bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <p className="text-gray-600">No trips available right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trips.map((trip) => {
                    const isSelected = selectedTrips.some(t => t?.id === trip.id);
                    const canAdd = selectedTrips.some(t => t === null);

                    return (
                      <div
                        key={trip.id}
                        className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                          isSelected ? 'opacity-50' : 'hover:-translate-y-1 hover:shadow-xl'
                        }`}
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={trip.image}
                            alt={trip.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-1">{trip.title}</h3>
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`${difficultyColors[trip.difficulty]} text-xs`}>
                              {trip.difficulty}
                            </Badge>
                            <span className="font-bold text-[var(--color-forest-600)]">US ${trip.price}</span>
                          </div>
                          {isSelected ? (
                            <Button variant="outline" size="sm" className="w-full" disabled>
                              Already Selected
                            </Button>
                          ) : canAdd ? (
                            <Button
                              size="sm"
                              className="w-full bg-[var(--color-navy-600)] hover:bg-[var(--color-navy-700)]"
                              onClick={() => {
                                const emptyIndex = selectedTrips.findIndex(t => t === null);
                                if (emptyIndex !== -1) addTrip(trip, emptyIndex);
                              }}
                            >
                              Add to Compare
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="w-full" disabled>
                              Max 3 Trips
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollAnimate>

          {/* CTA Section */}
          <ScrollAnimate animation="fade-in-up">
            <div className="mt-12 text-center glass-card rounded-3xl p-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                Need Help Choosing?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our travel experts are here to help you find the perfect adventure based on your preferences, 
                fitness level, and travel dates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:hello@trekkerssquad.example">
                  <Button size="lg" className="bg-[var(--color-forest-600)] hover:bg-[var(--color-forest-700)] glow-forest">
                    Contact Travel Experts
                  </Button>
                </a>
                <Link to="/all-trips">
                  <Button size="lg" variant="outline" className="gap-2">
                    Browse All Trips
                    <ArrowRight size={16} />
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
