import express from 'express';
import * as donutController from '../controllers/donutEconomics.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createDonutSegmentSchema,
  updateDonutSegmentSchema,
} from '../validators/donutEconomics.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, donutController.getDonutSegments);
router.get('/:id', optionalAuth, donutController.getDonutSegmentById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createDonutSegmentSchema), donutController.createDonutSegment);
router.put('/:id', authenticate, adminOnly, validate(updateDonutSegmentSchema), donutController.updateDonutSegment);
router.delete('/:id', authenticate, adminOnly, donutController.deleteDonutSegment);

export default router;
