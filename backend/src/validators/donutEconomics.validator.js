import { z } from 'zod';

const ringEnum = z.enum(['social', 'planetary']);

export const createDonutSegmentSchema = z.object({
  body: z.object({
    key: z.string().min(1, 'Segment key is required'),
    label: z.string().min(1, 'Label is required'),
    value: z.number().min(0, 'Value must be at least 0').max(100, 'Value must be 100 or less'),
    kpi: z.string().optional(),
    explanation: z.string().optional(),
    ring: ringEnum,
    imageUrl: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
  }),
});

export const updateDonutSegmentSchema = z.object({
  body: z.object({
    key: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
    value: z.number().min(0).max(100).optional(),
    kpi: z.string().optional(),
    explanation: z.string().optional(),
    ring: ringEnum.optional(),
    imageUrl: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
  }),
});
