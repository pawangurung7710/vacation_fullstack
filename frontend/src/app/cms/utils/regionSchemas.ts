import { z } from 'zod';

export const regionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
});

export type RegionFormValues = z.infer<typeof regionFormSchema>;
