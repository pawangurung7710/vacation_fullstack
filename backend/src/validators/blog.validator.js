import { z } from 'zod';

export const createBlogPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    excerpt: z.string().optional(),
    content: z.string().min(1, 'Content is required'),
    featuredImage: z.string().optional(),
    authorName: z.string().optional(),
    readTime: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
    fontFamily: z.string().optional().default('inter'),
    featured: z.boolean().optional().default(false),
  }),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    category: z.string().optional(),
    featured: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('publishedAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const blogStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'archived']),
  }),
});

export const blogFeaturedSchema = z.object({
  body: z.object({
    featured: z.boolean(),
  }),
});
