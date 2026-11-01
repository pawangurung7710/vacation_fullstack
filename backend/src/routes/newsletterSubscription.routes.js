import express from 'express';
import * as newsletterSubscriptionController from '../controllers/newsletterSubscription.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  subscribeNewsletterSchema,
  newsletterSubscriptionQuerySchema,
} from '../validators/newsletterSubscription.validator.js';

const router = express.Router();

// Public route
router.post('/', validate(subscribeNewsletterSchema), newsletterSubscriptionController.subscribe);

// Admin routes
router.get('/', authenticate, adminOnly, validate(newsletterSubscriptionQuerySchema), newsletterSubscriptionController.getAll);
router.get('/:id', authenticate, adminOnly, newsletterSubscriptionController.getById);
router.delete('/:id', authenticate, adminOnly, newsletterSubscriptionController.deleteById);

export default router;

