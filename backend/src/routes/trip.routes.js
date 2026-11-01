import express from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import { createTripSchema, updateTripSchema, tripQuerySchema } from '../validators/trip.validator.js';

const router = express.Router();

// Public routes (with optional auth for personalized content)
router.get('/', optionalAuth, validate(tripQuerySchema), tripController.getTrips);
router.get('/slug/:slug', optionalAuth, tripController.getTripBySlug);
router.get(
  '/category/:categorySlug/:subcategorySlug?',
  optionalAuth,
  validate(tripQuerySchema),
  tripController.getTripsByCategorySlugs
);
router.get('/:id', optionalAuth, tripController.getTripById);
router.post('/:id/view', optionalAuth, tripController.incrementTripView);

// Admin only routes
router.post('/', authenticate, adminOnly, validate(createTripSchema), tripController.createTrip);
router.put('/:id', authenticate, adminOnly, validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', authenticate, adminOnly, tripController.deleteTrip);
router.post('/:id/duplicate', authenticate, adminOnly, tripController.duplicateTrip);
router.post('/bulk', authenticate, adminOnly, tripController.bulkUpdateTrips);

export default router;
