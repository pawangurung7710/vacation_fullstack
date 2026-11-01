import { useState, useEffect } from 'react';
import { testimonialsApi } from '../services/api';

export interface Testimonial {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  location?: string;
  trip?: string | { title: string; _id: string; slug?: string };
  rating: number;
  testimonial: string;
  quote?: string;
  image?: string;
  status?: string;
  featured?: boolean;
}

export function useTestimonials(params?: {
  featured?: boolean;
  status?: string;
  trip?: string;
}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await testimonialsApi.getAll(params);
        // Transform API data to match frontend format
        const transformedTestimonials = data.map((testimonial: any) => ({
          ...testimonial,
          id: testimonial._id || testimonial.id,
          quote: testimonial.quote || testimonial.testimonial,
          trip: typeof testimonial.trip === 'object' ? testimonial.trip : testimonial.trip,
        }));
        setTestimonials(transformedTestimonials);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch testimonials'));
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [params?.featured, params?.status, params?.trip]);

  return { testimonials, loading, error };
}
