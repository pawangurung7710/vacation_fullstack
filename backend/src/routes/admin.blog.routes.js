import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogQuerySchema,
  blogStatusSchema,
  blogFeaturedSchema,
} from '../validators/blog.validator.js';

const router = express.Router();

router.get('/', authenticate, adminOnly, validate(blogQuerySchema), blogController.getAdminBlogPosts);
router.get('/:id', authenticate, adminOnly, blogController.getAdminBlogPostById);
router.post('/', authenticate, adminOnly, validate(createBlogPostSchema), blogController.createBlogPost);
router.put('/:id', authenticate, adminOnly, validate(updateBlogPostSchema), blogController.updateBlogPost);
router.delete('/:id', authenticate, adminOnly, blogController.deleteBlogPost);
router.patch('/:id/status', authenticate, adminOnly, validate(blogStatusSchema), blogController.updateBlogStatus);
router.patch('/:id/featured', authenticate, adminOnly, validate(blogFeaturedSchema), blogController.updateBlogFeatured);

export default router;
