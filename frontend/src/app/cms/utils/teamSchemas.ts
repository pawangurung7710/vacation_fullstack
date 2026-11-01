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

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email('Must be a valid email').optional()
);

const expertiseToArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim() !== '');
  }
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const teamFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  bio: z.preprocess(emptyToUndefined, z.string().optional()),
  image: optionalUrl,
  email: optionalEmail,
  socialLinks: z.object({
    linkedin: optionalUrl,
    instagram: optionalUrl,
    twitter: optionalUrl,
    website: optionalUrl,
  }),
  expertise: z.preprocess(expertiseToArray, z.array(z.string()).optional()),
  order: z.preprocess(orderToNumber, z.number().int().min(0, 'Order must be 0 or greater')),
  isActive: z.boolean().default(true),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;
