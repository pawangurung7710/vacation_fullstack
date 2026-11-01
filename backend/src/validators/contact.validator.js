import { z } from 'zod';

export const createContactSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, 'Message is required'),
  }),
});

export const replyContactSchema = z.object({
  body: z.object({
    replyMessage: z.string().min(1, 'Reply message is required'),
  }),
});

export const contactQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
    search: z.string().optional(),
  }),
});

