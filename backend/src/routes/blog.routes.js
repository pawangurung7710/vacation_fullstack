import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import { createBlogPostSchema, updateBlogPostSchema, blogQuerySchema } from '../validators/blog.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(blogQuerySchema), blogController.getBlogPosts);
router.get('/featured', blogController.getFeaturedBlogPosts);
router.get('/slug/:slug', optionalAuth, blogController.getBlogPostBySlug);
router.get('/:slug', optionalAuth, blogController.getBlogPostBySlug);

// Admin only routes
router.post('/', authenticate, adminOnly, validate(createBlogPostSchema), blogController.createBlogPost);
router.put('/:id', authenticate, adminOnly, validate(updateBlogPostSchema), blogController.updateBlogPost);
router.delete('/:id', authenticate, adminOnly, blogController.deleteBlogPost);

export default router;
