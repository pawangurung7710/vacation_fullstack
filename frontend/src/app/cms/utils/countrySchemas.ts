import { z } from 'zod';

export const countryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
});

export type CountryFormValues = z.infer<typeof countryFormSchema>;
