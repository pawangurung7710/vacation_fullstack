import { z } from 'zod';

export const subscribeNewsletterSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    source: z.string().min(1).optional(),
  }),
});

export const newsletterSubscriptionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
    search: z.string().min(1).optional(),
    source: z.string().min(1).optional(),
    status: z.enum(['subscribed', 'unsubscribed']).optional(),
  }),
});

