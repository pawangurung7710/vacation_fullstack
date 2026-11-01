import { z } from 'zod';

export const createRentalCategorySchema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateRentalCategorySchema = z.object({
  body: createRentalCategorySchema.shape.body.partial(),
});

export const rentalCategoryQuerySchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val === 'true' : undefined)),
    search: z.string().optional(),
  }),
});
