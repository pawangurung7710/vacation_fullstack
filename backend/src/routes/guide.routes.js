import express from 'express';
import * as guideController from '../controllers/guide.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, guideController.getGuides);
router.get('/:id', optionalAuth, guideController.getGuideById);

// Admin only routes
router.post('/', authenticate, adminOnly, guideController.createGuide);
router.put('/:id', authenticate, adminOnly, guideController.updateGuide);
router.delete('/:id', authenticate, adminOnly, guideController.deleteGuide);

export default router;

