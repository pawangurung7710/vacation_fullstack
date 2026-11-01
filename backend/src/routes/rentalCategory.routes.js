import express from 'express';
import * as rentalCategoryController from '../controllers/rentalCategory.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createRentalCategorySchema,
  updateRentalCategorySchema,
  rentalCategoryQuerySchema,
} from '../validators/rentalCategory.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(rentalCategoryQuerySchema), rentalCategoryController.getRentalCategories);
router.get('/:idOrSlug', optionalAuth, rentalCategoryController.getRentalCategoryByIdOrSlug);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createRentalCategorySchema), rentalCategoryController.createRentalCategory);
router.put('/:id', authenticate, adminOnly, validate(updateRentalCategorySchema), rentalCategoryController.updateRentalCategory);
router.delete('/:id', authenticate, adminOnly, rentalCategoryController.deleteRentalCategory);

export default router;
