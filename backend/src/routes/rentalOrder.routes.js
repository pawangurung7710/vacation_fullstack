import express from 'express';
import * as rentalOrderController from '../controllers/rentalOrder.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createRentalOrderSchema,
  updateRentalOrderSchema,
  rentalOrderQuerySchema,
} from '../validators/rentalOrder.validator.js';

const router = express.Router();

// Public route (guests can order)
router.post('/', optionalAuth, validate(createRentalOrderSchema), rentalOrderController.createRentalOrder);
router.get('/confirmation/:id', rentalOrderController.getRentalOrderConfirmation);

// Protected routes
router.get('/me', authenticate, validate(rentalOrderQuerySchema), rentalOrderController.getMyRentalOrders);
router.get('/me/:id', authenticate, rentalOrderController.getMyRentalOrderById);
router.get('/', authenticate, adminOnly, validate(rentalOrderQuerySchema), rentalOrderController.getRentalOrders);
router.get('/:id', authenticate, adminOnly, rentalOrderController.getRentalOrderById);
router.put('/:id', authenticate, adminOnly, validate(updateRentalOrderSchema), rentalOrderController.updateRentalOrder);
router.delete('/:id', authenticate, adminOnly, rentalOrderController.deleteRentalOrder);

export default router;
