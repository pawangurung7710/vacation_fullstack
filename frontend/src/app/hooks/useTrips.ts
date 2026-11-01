import { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';

export interface Trip {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  categoryId?: string;
  categorySlug?: string;
  subcategoryId?: string;
  subcategorySlug?: string;
  categoryLabel?: string;
  subcategoryLabel?: string;
  regionId?: string;
  regionLabel?: string;
  regionInfo?: {
    id?: string;
    name?: string;
  };
  category: any;
  region: string;
  country: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  price: number;
  image?: string;
  featuredImage?: string;
  brochureUrl?: string;
  views?: number;
  description: string;
  highlights: string[];
  sustainabilityBadges: string[];
  maxGroupSize: number;
  season?: string;
  distance?: string;
  transport?: string;
  heroSubtitle?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  departures?: Array<{
    _id?: string;
    startDate: string;
    endDate?: string;
    pricePerPerson?: number;
    totalSeats?: number;
    seatsAvailable?: number;
    status?: string;
    badges?: string[];
    notes?: string;
  }>;
  nextDepartureDate?: string;
  inclusions: string[];
  exclusions?: string[];
  itinerary?: { day: string; title: string; description: string }[];
  zeroWasteNotes?: string;
  featured?: boolean;
  status?: string;
  guides?: Array<{
    _id?: string;
    id?: string;
    name: string;
    role?: string;
    experience?: string;
    languages?: string;
    image?: string;
    quote?: string;
  }>;
  itineraryTitle?: string;
  itineraryDescription?: string;
  guidesSectionTitle?: string;
  guidesSectionSubtitle?: string;
  guidesQuote?: string;
  guidesQuoteAuthor?: string;
  guidesSafetyStatement?: string;
  pricingTitle?: string;
  pricingDescription?: string;
}

export function useTrips(params?: {
  categoryId?: string;
  categorySlug?: string;
  subcategoryId?: string;
  subcategorySlug?: string;
  featured?: boolean;
  country?: string;
  difficulty?: string;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await tripsApi.getAll(params);
        // Transform API data to match frontend format
        const transformedTrips = data.map((trip: any) => ({
          ...trip,
          id: trip._id || trip.id,
          image: trip.image || trip.featuredImage,
        }));
        setTrips(transformedTrips);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trips'));
        console.error('Error fetching trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [
    params?.categoryId,
    params?.categorySlug,
    params?.subcategoryId,
    params?.subcategorySlug,
    params?.featured,
    params?.country,
    params?.difficulty,
  ]);

  return { trips, loading, error };
}

export function useTrip(slugOrId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        // Try slug first, then ID
        let data;
        try {
          const looksLikeId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
          if (looksLikeId) {
            data = await tripsApi.getById(slugOrId);
          } else {
            data = await tripsApi.getBySlug(slugOrId);
          }
        } catch {
          data = await tripsApi.getById(slugOrId);
        }
        // Transform API data
        const transformedTrip = {
          ...data,
          id: data._id || data.id,
          image: data.image || data.featuredImage,
          guides: data.guides || [],
        };
        setTrip(transformedTrip);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trip'));
        console.error('Error fetching trip:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      fetchTrip();
    }
  }, [slugOrId]);

  return { trip, loading, error };
}
