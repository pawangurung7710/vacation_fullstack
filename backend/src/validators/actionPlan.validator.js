import { z } from 'zod';

const actionItemSchema = z.object({
  text: z.string().min(1, 'Action text is required'),
  completed: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
});

const actionCardSchema = z.object({
  key: z.string().min(1, 'Card key is required'),
  title: z.string().min(1, 'Card title is required'),
  theme: z.enum(['forest', 'glacier']),
  icon: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  actions: z.array(actionItemSchema).optional(),
});

export const createActionPlanSchema = z.object({
  body: z.object({
    slug: z.string().min(1, 'Slug is required'),
    title: z.string().min(1, 'Title is required'),
    cards: z.array(actionCardSchema).optional(),
  }),
});

export const updateActionPlanSchema = z.object({
  body: z.object({
    slug: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    cards: z.array(actionCardSchema).optional(),
  }),
});
