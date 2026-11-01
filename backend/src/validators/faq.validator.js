import { z } from 'zod';

const faqItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

export const createFaqCategorySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    icon: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
    faqs: z.array(faqItemSchema).optional(),
  }),
});

export const updateFaqCategorySchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    icon: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
    faqs: z.array(faqItemSchema).optional(),
  }),
});
