import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingQuerySchema,
} from '../validators/booking.validator.js';

const router = express.Router();

// Public route (guests can book)
router.post('/', optionalAuth, validate(createBookingSchema), bookingController.createBooking);
router.get('/confirmation/:id', bookingController.getBookingConfirmation);

// Protected routes
router.get('/me', authenticate, validate(bookingQuerySchema), bookingController.getMyBookings);
router.get('/me/:id', authenticate, bookingController.getMyBookingById);
router.get('/', authenticate, adminOnly, validate(bookingQuerySchema), bookingController.getBookings);
router.get('/:id', authenticate, adminOnly, bookingController.getBookingById);
router.put('/:id', authenticate, adminOnly, validate(updateBookingSchema), bookingController.updateBooking);
router.delete('/:id', authenticate, adminOnly, bookingController.deleteBooking);

export default router;
