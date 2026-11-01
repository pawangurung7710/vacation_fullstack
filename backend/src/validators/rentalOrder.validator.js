import { z } from 'zod';

const orderItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
});

export const createRentalOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    deliveryMethod: z.enum(['pickup', 'delivery']).optional(),
    deliveryAddress: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    consents: z
      .object({
        termsAccepted: z.boolean().optional(),
      })
      .optional(),
    notes: z.string().optional(),
    guestInfo: z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateRentalOrderSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'delivered', 'returned', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
    adminNotes: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const rentalOrderQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.enum(['pending', 'confirmed', 'delivered', 'returned', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
    user: z.string().optional(),
  }),
});
