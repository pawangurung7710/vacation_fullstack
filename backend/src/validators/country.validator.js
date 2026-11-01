import { z } from 'zod';

export const createCountrySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    isActive: z.boolean().optional(),
  }),
});

export const updateCountrySchema = z.object({
  body: createCountrySchema.shape.body.partial(),
});

export const countryQuerySchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val === 'true' : undefined)),
    search: z.string().optional(),
  }),
});
