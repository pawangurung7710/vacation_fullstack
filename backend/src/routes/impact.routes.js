import express from 'express';
import * as impactController from '../controllers/impact.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, impactController.getImpactMetrics);
router.get('/:id', optionalAuth, impactController.getImpactMetricById);

// Admin only routes
router.post('/', authenticate, adminOnly, impactController.createImpactMetric);
router.put('/:id', authenticate, adminOnly, impactController.updateImpactMetric);
router.delete('/:id', authenticate, adminOnly, impactController.deleteImpactMetric);

export default router;

