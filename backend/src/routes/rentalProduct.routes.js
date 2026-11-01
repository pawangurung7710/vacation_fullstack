import express from 'express';
import * as rentalProductController from '../controllers/rentalProduct.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createRentalProductSchema,
  updateRentalProductSchema,
  rentalProductQuerySchema,
  rentalProductAvailabilityQuerySchema,
} from '../validators/rentalProduct.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(rentalProductQuerySchema), rentalProductController.getRentalProducts);
router.get('/slug/:slug', optionalAuth, rentalProductController.getRentalProductBySlug);
router.get(
  '/:id/availability',
  validate(rentalProductAvailabilityQuerySchema),
  rentalProductController.getRentalProductAvailability
);
router.post('/:id/view', optionalAuth, rentalProductController.incrementRentalProductView);
router.get('/:id', optionalAuth, rentalProductController.getRentalProductById);

// Admin only routes
router.post('/', authenticate, adminOnly, validate(createRentalProductSchema), rentalProductController.createRentalProduct);
router.put('/:id', authenticate, adminOnly, validate(updateRentalProductSchema), rentalProductController.updateRentalProduct);
router.delete('/:id', authenticate, adminOnly, rentalProductController.deleteRentalProduct);

export default router;
