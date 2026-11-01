import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

const orderToNumber = (value: unknown) => {
  if (value === '' || value === undefined || value === null) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url('Must be a valid URL').optional()
);

export const guideFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  experience: z.preprocess(emptyToUndefined, z.string().optional()),
  languages: z.preprocess(emptyToUndefined, z.string().optional()),
  imageUrl: optionalUrl,
  quote: z.preprocess(emptyToUndefined, z.string().optional()),
  order: z.preprocess(orderToNumber, z.number().int().min(0, 'Order must be 0 or greater')),
  isActive: z.boolean().default(true),
});

export type GuideFormValues = z.infer<typeof guideFormSchema>;

