import { z } from 'zod';

const iconSchema = z.enum(['target', 'users', 'heart', 'leaf']);
const themeSchema = z.enum(['glacier', 'forest', 'purple', 'saffron']);

const cardItemSchema = z.object({
  title: z.string().min(1, 'Card title is required'),
  description: z.string().min(1, 'Card description is required'),
});

const cardsBlockSchema = z.object({
  id: z.string().min(1, 'Block id is required'),
  type: z.literal('cards'),
  title: z.string().min(1, 'Block title is required'),
  icon: iconSchema,
  theme: themeSchema,
  intro: z.array(z.string().min(1)).optional(),
  initialVisibleCount: z.number().int().positive().optional(),
  items: z.array(cardItemSchema).optional(),
});

const bulletsBlockSchema = z.object({
  id: z.string().min(1, 'Block id is required'),
  type: z.literal('bullets'),
  title: z.string().min(1, 'Block title is required'),
  icon: iconSchema,
  theme: themeSchema,
  initialVisibleCount: z.number().int().positive().optional(),
  items: z.array(z.string().min(1, 'Bullet text is required')).optional(),
});

const blockSchema = z.discriminatedUnion('type', [cardsBlockSchema, bulletsBlockSchema]);

export const createSustainabilityVisionSchema = z.object({
  body: z.object({
    slug: z.string().min(1, 'Slug is required'),
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().min(1, 'Subtitle is required'),
    blocks: z.array(blockSchema).optional(),
  }),
});

export const updateSustainabilityVisionSchema = z.object({
  body: z.object({
    slug: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    subtitle: z.string().min(1).optional(),
    blocks: z.array(blockSchema).optional(),
  }),
});

