import * as blogService from '../services/blog.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all blog posts
 */
export const getBlogPosts = async (req, res, next) => {
  try {
    const { posts, pagination } = await blogService.getBlogPosts(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Blog posts retrieved successfully', posts, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get blog post by ID
 */
export const getBlogPostById = async (req, res, next) => {
  try {
    const post = await blogService.getBlogPostById(req.params.id);
    return sendSuccess(res, 'Blog post retrieved successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: get blog post by ID
 */
export const getAdminBlogPostById = async (req, res, next) => {
  try {
    const post = await blogService.getBlogPostById(req.params.id, { includeAll: true });
    return sendSuccess(res, 'Blog post retrieved successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Get blog post by slug
 */
export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const post = await blogService.getBlogPostBySlug(req.params.slug);
    return sendSuccess(res, 'Blog post retrieved successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured blog posts
 */
export const getFeaturedBlogPosts = async (req, res, next) => {
  try {
    const parsedLimit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const limit = Number.isNaN(parsedLimit) ? undefined : parsedLimit;
    const posts = await blogService.getFeaturedBlogPosts(limit);
    return sendSuccess(res, 'Featured blog posts retrieved successfully', posts);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new blog post
 */
export const createBlogPost = async (req, res, next) => {
  try {
    const post = await blogService.createBlogPost(req.body, req.user.id);
    return sendCreated(res, 'Blog post created successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Update blog post
 */
export const updateBlogPost = async (req, res, next) => {
  try {
    const post = await blogService.updateBlogPost(req.params.id, req.body);
    return sendSuccess(res, 'Blog post updated successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete blog post
 */
export const deleteBlogPost = async (req, res, next) => {
  try {
    await blogService.archiveBlogPost(req.params.id);
    return sendSuccess(res, 'Blog post archived successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: get blog posts
 */
export const getAdminBlogPosts = async (req, res, next) => {
  try {
    const { posts, pagination } = await blogService.getBlogPosts(
      req.query,
      { page: req.query.page, limit: req.query.limit },
      { includeAll: true }
    );
    return sendSuccess(res, 'Blog posts retrieved successfully', posts, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: update status
 */
export const updateBlogStatus = async (req, res, next) => {
  try {
    const post = await blogService.updateBlogStatus(req.params.id, req.body.status);
    return sendSuccess(res, 'Blog post status updated successfully', post);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: update featured
 */
export const updateBlogFeatured = async (req, res, next) => {
  try {
    const post = await blogService.updateBlogFeatured(req.params.id, req.body.featured);
    return sendSuccess(res, 'Blog post featured updated successfully', post);
  } catch (error) {
    next(error);
  }
};
