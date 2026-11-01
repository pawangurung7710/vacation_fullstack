import express from 'express';
import * as faqController from '../controllers/faq.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createFaqCategorySchema,
  updateFaqCategorySchema,
} from '../validators/faq.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, faqController.getFaqCategories);
router.get('/:id', optionalAuth, faqController.getFaqCategoryById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createFaqCategorySchema), faqController.createFaqCategory);
router.put('/:id', authenticate, adminOnly, validate(updateFaqCategorySchema), faqController.updateFaqCategory);
router.delete('/:id', authenticate, adminOnly, faqController.deleteFaqCategory);

export default router;
