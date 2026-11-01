import { z } from 'zod';

export const createRegionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    isActive: z.boolean().optional(),
  }),
});

export const updateRegionSchema = z.object({
  body: createRegionSchema.shape.body.partial(),
});

export const regionQuerySchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val === 'true' : undefined)),
    search: z.string().optional(),
  }),
});
