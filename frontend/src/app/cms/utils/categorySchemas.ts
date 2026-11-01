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

export const categoryFormSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  tagline: z.preprocess(emptyToUndefined, z.string().optional()),
  subtitle: z.preprocess(emptyToUndefined, z.string().optional()),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  imageUrl: optionalUrl,
  heroImage: optionalUrl,
  order: z.preprocess(orderToNumber, z.number().int().min(0, 'Order must be 0 or greater')),
  isActive: z.boolean().default(true),
});

export const subcategoryFormSchema = categoryFormSchema.extend({
  parent: z.string().min(1, 'Parent category is required'),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;
