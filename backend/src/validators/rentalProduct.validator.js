import { z } from 'zod';

const specificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createRentalProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    category: z.string().min(1, 'Category is required').optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    images: z.array(z.string()).optional(),
    pricePerDay: z.number().min(0, 'Price must be positive').optional(),
    depositAmount: z.number().min(0).optional(),
    quantityTotal: z.number().int().min(1).optional(),
    sku: z.string().optional(),
    specifications: z.array(specificationSchema).optional(),
    minRentalDays: z.number().int().min(1).optional(),
    featured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const updateRentalProductSchema = z.object({
  body: createRentalProductSchema.shape.body.partial(),
});

export const rentalProductQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    category: z.string().optional(),
    categorySlug: z.string().optional(),
    status: z.string().optional(),
    featured: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? val === 'true' : undefined)),
    search: z.string().optional(),
    minPrice: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const rentalProductAvailabilityQuerySchema = z.object({
  query: z.object({
    deliveryDate: z.string().min(1, 'Delivery date is required'),
    returnDate: z.string().min(1, 'Return date is required'),
    quantity: z.string().optional(),
  }),
});
