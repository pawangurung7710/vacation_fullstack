import mongoose from 'mongoose';
import Guide from '../models/Guide.js';
import Trip from '../models/Trip.js';

/**
 * Get all guides
 */
export const getGuides = async (filters = {}) => {
  const query = {};
  if (Object.prototype.hasOwnProperty.call(filters, 'isActive')) {
    const isActiveRaw = filters.isActive;
    if (isActiveRaw === true || isActiveRaw === 'true') {
      query.isActive = true;
    } else if (isActiveRaw === false || isActiveRaw === 'false') {
      query.isActive = false;
    }
  }

  const guides = await Guide.find(query).sort({ order: 1, createdAt: -1 });
  return guides;
};

/**
 * Get guide by ID
 */
export const getGuideById = async (guideId) => {
  const guide = await Guide.findById(guideId);
  if (!guide) {
    throw new Error('Guide not found');
  }
  return guide;
};

/**
 * Create new guide
 */
export const createGuide = async (guideData) => {
  const guide = new Guide(guideData);
  await guide.save();
  return guide;
};

/**
 * Update guide
 */
export const updateGuide = async (guideId, updateData) => {
  const guide = await Guide.findById(guideId);
  if (!guide) {
    throw new Error('Guide not found');
  }

  Object.assign(guide, updateData);
  await guide.save();
  return guide;
};

/**
 * Delete guide
 */
export const deleteGuide = async (guideId) => {
  const guide = await Guide.findById(guideId);
  if (!guide) {
    throw new Error('Guide not found');
  }

  const resolvedGuideId = mongoose.Types.ObjectId.isValid(guideId)
    ? new mongoose.Types.ObjectId(guideId)
    : guide._id;

  const tripsUsingGuide = await Trip.countDocuments({ guides: resolvedGuideId });
  if (tripsUsingGuide > 0) {
    const error = new Error(
      'This guide is associated to a trip. Cannot delete it. Remove the guide from the trip by updating the trip and then delete it or set the guide as inactive so it does not show up on trip pages.'
    );
    error.statusCode = 400;
    throw error;
  }

  await guide.deleteOne();
  return guide;
};
