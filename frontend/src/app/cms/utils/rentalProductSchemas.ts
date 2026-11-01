import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') {
    return undefined;
  }
  return value;
};

const toNumber = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const specificationSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
});

export const rentalProductFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  category: z.string().min(1, 'Category is required'),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  shortDescription: z.preprocess(emptyToUndefined, z.string().optional()),
  pricePerDay: z.preprocess(toNumber, z.number({ required_error: 'Price per day is required' }).min(0, 'Price must be positive')),
  depositAmount: z.preprocess(toNumber, z.number().min(0, 'Deposit must be positive').optional().default(0)),
  quantityTotal: z.preprocess(toNumber, z.number({ required_error: 'Quantity is required' }).int().min(1, 'Quantity must be at least 1')),
  sku: z.preprocess(emptyToUndefined, z.string().optional()),
  minRentalDays: z.preprocess(toNumber, z.number().int().min(1, 'Minimum rental days must be at least 1').optional().default(1)),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  specifications: z.array(specificationSchema).default([]),
  images: z.array(z.string()).default([]),
});

export type RentalProductFormValues = z.infer<typeof rentalProductFormSchema>;
