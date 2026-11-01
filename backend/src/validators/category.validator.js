import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    slug: z.string().optional(),
    tagline: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    heroImage: z.string().optional(),
    parent: z.string().nullable().optional(),
    level: z.number().int().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial(),
});

export const categoryQuerySchema = z.object({
  query: z.object({
    parent: z.string().optional(),
    level: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
    isActive: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val === 'true' : undefined)),
    search: z.string().optional(),
  }),
});
