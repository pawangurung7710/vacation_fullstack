import Testimonial from '../models/Testimonial.js';

/**
 * Get all testimonials with filtering and pagination
 */
export const getTestimonials = async (filters = {}, pagination = {}) => {
  const { status, trip, featured } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (status) query.status = status;
  if (trip) query.trip = trip;
  if (featured !== undefined) query.featured = featured;

  const skip = (page - 1) * limit;

  const [testimonials, total] = await Promise.all([
    Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('trip', 'title slug'),
    Testimonial.countDocuments(query),
  ]);

  return {
    testimonials,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get testimonial by ID
 */
export const getTestimonialById = async (testimonialId) => {
  const testimonial = await Testimonial.findById(testimonialId).populate('trip', 'title slug');
  if (!testimonial) {
    throw new Error('Testimonial not found');
  }
  return testimonial;
};

/**
 * Create new testimonial
 */
export const createTestimonial = async (testimonialData) => {
  const testimonial = new Testimonial(testimonialData);
  await testimonial.save();
  return testimonial.populate('trip', 'title slug');
};

/**
 * Update testimonial
 */
export const updateTestimonial = async (testimonialId, updateData, userId = null) => {
  const testimonial = await Testimonial.findById(testimonialId);
  if (!testimonial) {
    throw new Error('Testimonial not found');
  }

  // If approving, set approval fields
  if (updateData.status === 'approved' && testimonial.status !== 'approved') {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  }

  Object.assign(testimonial, updateData);
  await testimonial.save();

  await testimonial.populate('trip', 'title slug');
  await testimonial.populate('approvedBy', 'name email');
  return testimonial;
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (testimonialId) => {
  const testimonial = await Testimonial.findByIdAndDelete(testimonialId);
  if (!testimonial) {
    throw new Error('Testimonial not found');
  }
  return testimonial;
};
