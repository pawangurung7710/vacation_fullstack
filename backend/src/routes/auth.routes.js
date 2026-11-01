import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validator.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} from '../validators/auth.validator.js';
import { authRateLimiter, avatarUploadRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// Dedicated multer config for avatar uploads (image-only, small size cap), separate
// from media.routes.js's admin-only upload so any signed-in user can set their own
// avatar without needing admin rights.
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Invalid file type. Only JPG, PNG, or WEBP images are allowed.'));
  },
});

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateMe);
router.post('/me/avatar', authenticate, avatarUploadRateLimiter, avatarUpload.single('avatar'), authController.uploadAvatar);
router.patch('/me/password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.patch('/me/settings', authenticate, validate(updateSettingsSchema), authController.updateSettings);

export default router;
