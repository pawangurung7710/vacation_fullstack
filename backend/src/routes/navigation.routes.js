import express from 'express';
import * as navigationController from '../controllers/navigation.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, navigationController.getNavigationItems);
router.get('/:id', optionalAuth, navigationController.getNavigationItemById);

// Admin only routes
router.post('/', authenticate, adminOnly, navigationController.createNavigationItem);
router.put('/:id', authenticate, adminOnly, navigationController.updateNavigationItem);
router.delete('/:id', authenticate, adminOnly, navigationController.deleteNavigationItem);

export default router;

