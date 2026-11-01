import express from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../validators/category.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(categoryQuerySchema), categoryController.getCategories);
router.get('/:id', optionalAuth, categoryController.getCategoryById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, adminOnly, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, adminOnly, categoryController.deleteCategory);

export default router;
