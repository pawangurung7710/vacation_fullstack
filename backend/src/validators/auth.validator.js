import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateSettingsSchema = z.object({
  body: z.object({
    theme: z
      .object({
        mode: z.enum(['light', 'dark']).optional(),
        accent: z
          .enum([
            'ocean',
            'forest',
            'sunset',
            'glacier',
            'midnight',
            'rose',
            'indigo',
            'teal',
            'yellow',
            'red',
            'sky',
            'peach',
            'plum',
            'mint',
            'cobalt',
            'sand',
          ])
          .optional(),
        sidebarColor: z
          .enum([
            'ocean',
            'forest',
            'sunset',
            'glacier',
            'midnight',
            'rose',
            'indigo',
            'teal',
            'yellow',
            'red',
            'sky',
            'peach',
            'plum',
            'mint',
            'cobalt',
            'sand',
          ])
          .optional(),
        fontScale: z.enum(['small', 'normal', 'large']).optional(),
      })
      .optional(),
    preferences: z
      .object({
        compactTables: z.boolean().optional(),
        reduceMotion: z.boolean().optional(),
      })
      .optional(),
  }),
});
