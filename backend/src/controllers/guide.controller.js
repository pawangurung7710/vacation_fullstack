import * as guideService from '../services/guide.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all guides
 */
export const getGuides = async (req, res, next) => {
  try {
    const guides = await guideService.getGuides(req.query);
    return sendSuccess(res, 'Guides retrieved successfully', guides);
  } catch (error) {
    next(error);
  }
};

/**
 * Get guide by ID
 */
export const getGuideById = async (req, res, next) => {
  try {
    const guide = await guideService.getGuideById(req.params.id);
    return sendSuccess(res, 'Guide retrieved successfully', guide);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new guide
 */
export const createGuide = async (req, res, next) => {
  try {
    const guide = await guideService.createGuide(req.body);
    return sendCreated(res, 'Guide created successfully', guide);
  } catch (error) {
    next(error);
  }
};

/**
 * Update guide
 */
export const updateGuide = async (req, res, next) => {
  try {
    const guide = await guideService.updateGuide(req.params.id, req.body);
    return sendSuccess(res, 'Guide updated successfully', guide);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete guide
 */
export const deleteGuide = async (req, res, next) => {
  try {
    await guideService.deleteGuide(req.params.id);
    return sendSuccess(res, 'Guide deleted successfully');
  } catch (error) {
    next(error);
  }
};

