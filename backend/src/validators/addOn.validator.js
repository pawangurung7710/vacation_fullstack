import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const optionSchema = z.object({
  label: z.preprocess(emptyToUndefined, z.string().optional()),
  price: z.number().min(0, 'Price must be positive').optional().default(0),
  priceUnit: z.preprocess(emptyToUndefined, z.string().optional()),
});

const baseAddOnSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.preprocess(emptyToUndefined, z.string().optional()),
  kind: z.enum(['comfort', 'activity']),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  image: z.preprocess(emptyToUndefined, z.string().optional()),
  pricingType: z.enum(['flat', 'choice']).optional().default('flat'),
  price: z.number().min(0, 'Price must be positive').optional(),
  priceUnit: z.preprocess(emptyToUndefined, z.string().optional()),
  options: z.array(optionSchema).optional().default([]),
  duration: z.preprocess(emptyToUndefined, z.string().optional()),
  activityType: z.enum(['Activity', 'Experience', 'Retreat', 'Workshop']).optional().default('Activity'),
  location: z.preprocess(emptyToUndefined, z.string().optional()),
  badges: z.array(z.string()).optional().default([]),
  discountEligible: z.boolean().optional().default(true),
  scope: z.enum(['global', 'trips']).optional().default('global'),
  trips: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  order: z.number().int().min(0).optional().default(0),
});

export const createAddOnSchema = z.object({
  body: baseAddOnSchema,
});

export const updateAddOnSchema = z.object({
  body: baseAddOnSchema.partial(),
});

export const addOnQuerySchema = z.object({
  query: z.object({
    kind: z.enum(['comfort', 'activity']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    scope: z.enum(['global', 'trips']).optional(),
    trip: z.string().optional(),
  }),
});
