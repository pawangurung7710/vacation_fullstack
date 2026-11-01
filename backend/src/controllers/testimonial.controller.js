import * as testimonialService from '../services/testimonial.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all testimonials
 */
export const getTestimonials = async (req, res, next) => {
  try {
    const { testimonials, pagination } = await testimonialService.getTestimonials(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Testimonials retrieved successfully', testimonials, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get testimonial by ID
 */
export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.getTestimonialById(req.params.id);
    return sendSuccess(res, 'Testimonial retrieved successfully', testimonial);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new testimonial
 */
export const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.createTestimonial(req.body);
    return sendCreated(res, 'Testimonial submitted successfully', testimonial);
  } catch (error) {
    next(error);
  }
};

/**
 * Update testimonial
 */
export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body, req.user.id);
    return sendSuccess(res, 'Testimonial updated successfully', testimonial);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (req, res, next) => {
  try {
    await testimonialService.deleteTestimonial(req.params.id);
    return sendSuccess(res, 'Testimonial deleted successfully');
  } catch (error) {
    next(error);
  }
};

