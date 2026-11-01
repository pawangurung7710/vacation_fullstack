import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TripCard } from '../components/trip-card';
import { Breadcrumbs } from '../components/breadcrumbs';
import { categoriesApi, resolveMediaUrl, tripsApi } from '../services/api';

export function DynamicCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [categoryData, setCategoryData] = useState<any | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryNotFound, setCategoryNotFound] = useState(false);
  const [loadedHeroSrc, setLoadedHeroSrc] = useState<string | null>(null);

  const resolvedTitle = categoryData?.label || categoryData?.name || 'Trips';
  const resolvedDescription = categoryData?.description || categoryData?.tagline || 'Explore our curated experiences';
  const resolvedSubtitle = categoryData?.subtitle;
  const resolvedHeroImage = resolveMediaUrl(
    categoryData?.heroImage ||
    categoryData?.imageUrl ||
    'https://images.unsplash.com/photo-1571401847270-78ab5f316800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    { width: 1920, height: 900, crop: 'c_fill' }
  );

  useEffect(() => {
    if (!resolvedHeroImage) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = resolvedHeroImage;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [resolvedHeroImage]);

  useEffect(() => {
    const loadData = async () => {
      if (!categorySlug) return;
      
      setLoading(true);
      setCategoryNotFound(false);
      try {
        const categories = await categoriesApi.getAll({ level: 0, isActive: true });
        const matched = categories.find((cat: any) => cat.slug === categorySlug);
        
        if (!matched) {
          setCategoryNotFound(true);
          setCategoryData(null);
          setTrips([]);
          setLoading(false);
          return;
        }
        
        setCategoryData(matched);

        const tripsResult = await tripsApi.getAllWithMeta({ categorySlug });
        setTrips(tripsResult.data || []);
      } catch (error) {
        setCategoryNotFound(true);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categorySlug]);

  // Show error message if category not found
  if (!loading && categoryNotFound) {
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

  return (
    <div className="min-h-screen bg-[var(--color-navy-50)]">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[460px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src={resolvedHeroImage}
            alt={resolvedTitle}
            className={`w-full h-full object-cover transition-opacity duration-500 ${loadedHeroSrc === resolvedHeroImage ? 'opacity-100' : 'opacity-0'}`}
            fetchPriority="high"
            onLoad={() => setLoadedHeroSrc(resolvedHeroImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        </div>
        
        <div className="relative z-10 h-full flex items-end pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumbs 
              items={[{ label: resolvedTitle }]} 
              className="mb-8 [&_a]:!text-white/80 [&_a:hover]:!text-white [&_li>span]:!text-white/60 [&_svg]:!text-inherit"
            />
            <div className="max-w-3xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl mb-6 !text-white font-semibold leading-[1.05]">
                {resolvedTitle}
              </h1>
              {resolvedSubtitle && (
                <p className="text-xl sm:text-2xl text-white/90 glass-text-contrast mb-4 font-medium">
                  {resolvedSubtitle}
                </p>
              )}
              <p className="text-xl sm:text-2xl text-white/95 glass-text-contrast leading-relaxed">
                {resolvedDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`loading-${idx}`} className="overflow-hidden rounded-2xl bg-white/80 shadow-sm">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-9 w-full bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <>
            <div className="mb-8">
              <p className="text-gray-600">
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'} available
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <TripCard key={trip.id || trip._id} trip={trip} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-2xl mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              We're currently designing new {resolvedTitle} experiences. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
