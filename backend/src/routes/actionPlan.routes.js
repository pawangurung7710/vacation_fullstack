import express from 'express';
import * as actionPlanController from '../controllers/actionPlan.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createActionPlanSchema,
  updateActionPlanSchema,
} from '../validators/actionPlan.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, actionPlanController.getActionPlans);
router.get('/slug/:slug', optionalAuth, actionPlanController.getActionPlanBySlug);
router.get('/:id', optionalAuth, actionPlanController.getActionPlanById);

// Admin routes
router.post('/', authenticate, adminOnly, validate(createActionPlanSchema), actionPlanController.createActionPlan);
router.put('/:id', authenticate, adminOnly, validate(updateActionPlanSchema), actionPlanController.updateActionPlan);
router.delete('/:id', authenticate, adminOnly, actionPlanController.deleteActionPlan);

export default router;
