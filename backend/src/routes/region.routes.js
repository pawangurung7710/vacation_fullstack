import express from 'express';
import * as regionController from '../controllers/region.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createRegionSchema,
  updateRegionSchema,
  regionQuerySchema,
} from '../validators/region.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(regionQuerySchema), regionController.getRegions);
router.get('/:id', optionalAuth, regionController.getRegionById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createRegionSchema), regionController.createRegion);
router.put('/:id', authenticate, adminOnly, validate(updateRegionSchema), regionController.updateRegion);
router.delete('/:id', authenticate, adminOnly, regionController.deleteRegion);

export default router;
