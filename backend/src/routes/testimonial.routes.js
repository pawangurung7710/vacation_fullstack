import express from 'express';
import * as testimonialController from '../controllers/testimonial.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  testimonialQuerySchema,
} from '../validators/testimonial.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(testimonialQuerySchema), testimonialController.getTestimonials);
router.post('/', validate(createTestimonialSchema), testimonialController.createTestimonial);
router.get('/:id', optionalAuth, testimonialController.getTestimonialById);

// Admin only routes
router.put('/:id', authenticate, adminOnly, validate(updateTestimonialSchema), testimonialController.updateTestimonial);
router.delete('/:id', authenticate, adminOnly, testimonialController.deleteTestimonial);

export default router;

