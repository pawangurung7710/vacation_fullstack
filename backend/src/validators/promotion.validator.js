import { z } from 'zod';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const dateString = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    return value;
  }, z.string().datetime())
  .optional();

const baseSchema = z.object({
  title: z.preprocess(emptyToUndefined, z.string().min(1, 'Title is required')),
  code: z.preprocess(emptyToUndefined, z.string().min(1, 'Promo code is required')),
  description: z.preprocess(emptyToUndefined, z.string()).optional(),
  type: z.enum(['global', 'trip']).optional().default('global'),
  trip: z.preprocess(emptyToUndefined, z.string().optional()),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be positive'),
  isActive: z.boolean().optional(),
  validFrom: dateString,
  validUntil: dateString,
});

export const createPromotionSchema = z.object({
  body: baseSchema.superRefine((data, ctx) => {
    if (data.type === 'trip' && !data.trip) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Trip is required for trip-level promotions',
        path: ['trip'],
      });
    }

    if (data.discountType === 'percentage' && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage must be between 0 and 100',
        path: ['discountValue'],
      });
    }

    if (data.validFrom && data.validUntil) {
      const from = new Date(data.validFrom);
      const until = new Date(data.validUntil);
      if (from.toString() === 'Invalid Date' || until.toString() === 'Invalid Date') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dates must be valid',
          path: ['validFrom', 'validUntil'],
        });
      } else if (from > until) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid until must be after valid from',
          path: ['validUntil'],
        });
      }
    }
  }),
});

const updateSchema = baseSchema.partial();

export const updatePromotionSchema = z.object({
  body: updateSchema.superRefine((data, ctx) => {
    if (data.discountType === 'percentage' && data.discountValue !== undefined && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage must be between 0 and 100',
        path: ['discountValue'],
      });
    }

    if (data.validFrom && data.validUntil) {
      const from = new Date(data.validFrom);
      const until = new Date(data.validUntil);
      if (from.toString() === 'Invalid Date' || until.toString() === 'Invalid Date') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dates must be valid',
          path: ['validFrom', 'validUntil'],
        });
      } else if (from > until) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Valid until must be after valid from',
          path: ['validUntil'],
        });
      }
    }
  }),
});
