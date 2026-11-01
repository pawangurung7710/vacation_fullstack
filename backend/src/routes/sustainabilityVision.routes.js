import express from 'express';
import * as sustainabilityVisionController from '../controllers/sustainabilityVision.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createSustainabilityVisionSchema,
  updateSustainabilityVisionSchema,
} from '../validators/sustainabilityVision.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, sustainabilityVisionController.getSustainabilityVisions);
router.get('/slug/:slug', optionalAuth, sustainabilityVisionController.getSustainabilityVisionBySlug);
router.get('/:id', optionalAuth, sustainabilityVisionController.getSustainabilityVisionById);

// Admin routes
router.post(
  '/',
  authenticate,
  adminOnly,
  validate(createSustainabilityVisionSchema),
  sustainabilityVisionController.createSustainabilityVision
);
router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate(updateSustainabilityVisionSchema),
  sustainabilityVisionController.updateSustainabilityVision
);
router.delete('/:id', authenticate, adminOnly, sustainabilityVisionController.deleteSustainabilityVision);

export default router;

