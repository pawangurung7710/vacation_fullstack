import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    trip: z.string().min(1, 'Trip ID is required'),
    numberOfParticipants: z.number().int().positive('Must have at least 1 participant'),
    departureDate: z.string().datetime('Invalid date format'),
    totalPrice: z.number().min(0, 'Price must be positive'),
    specialRequests: z.string().optional(),
    promoCode: z.string().optional(),
    promoDiscount: z.number().min(0, 'Promo discount cannot be negative').optional(),
    emergencyContact: z
      .object({
        name: z.string().min(1),
        phone: z.string().min(1),
      })
      .optional(),
    party: z
      .object({
        adults: z.number().int().nonnegative().optional(),
        children: z.number().int().nonnegative().optional(),
      })
      .optional(),
    addOns: z
      .array(
        z.object({
          id: z.string().optional(),
          title: z.string().optional(),
          kind: z.string().optional(),
          type: z.string().optional(),
          optionLabel: z.string().optional(),
          duration: z.string().optional(),
          location: z.string().optional(),
          discountEligible: z.boolean().optional(),
          price: z.number().optional(),
        })
      )
      .optional(),
    consents: z
      .object({
        termsAccepted: z.boolean().optional(),
        marketingOptIn: z.boolean().optional(),
        travelInsuranceAcknowledged: z.boolean().optional(),
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

export const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
    adminNotes: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const bookingQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
    trip: z.string().optional(),
    user: z.string().optional(),
  }),
});
