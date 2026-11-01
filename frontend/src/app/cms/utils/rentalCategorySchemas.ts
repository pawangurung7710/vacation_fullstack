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

export const rentalCategoryFormSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  imageUrl: optionalUrl,
  order: z.preprocess(orderToNumber, z.number().int().min(0, 'Order must be 0 or greater')),
  isActive: z.boolean().default(true),
});

export type RentalCategoryFormValues = z.infer<typeof rentalCategoryFormSchema>;
