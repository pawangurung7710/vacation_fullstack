import express from 'express';
import * as pageController from '../controllers/page.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, pageController.getPageContents);
router.get('/:key', optionalAuth, pageController.getPageContentByKey);

// Admin only routes
router.post('/', authenticate, adminOnly, pageController.createPageContent);
router.put('/:key', authenticate, adminOnly, pageController.updatePageContent);
router.delete('/:key', authenticate, adminOnly, pageController.deletePageContent);

export default router;

