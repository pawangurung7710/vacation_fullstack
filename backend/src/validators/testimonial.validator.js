import { z } from 'zod';

export const createTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional(),
    trip: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    testimonial: z.string().min(1, 'Testimonial text is required'),
    image: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    trip: z.string().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    testimonial: z.string().min(1, 'Testimonial text is required').optional(),
    image: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    featured: z.boolean().optional(),
  }),
});

export const testimonialQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    trip: z.string().optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
  }),
});
