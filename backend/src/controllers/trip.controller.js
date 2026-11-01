import * as tripService from '../services/trip.service.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';

/**
 * Get all trips
 */
export const getTrips = async (req, res, next) => {
  try {
    const { trips, pagination } = await tripService.getTrips(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Trips retrieved successfully', trips, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trips by category/subcategory slug
 */
export const getTripsByCategorySlugs = async (req, res, next) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;
    const { trips, pagination } = await tripService.getTrips(
      { ...req.query, categorySlug, subcategorySlug },
      {
        page: req.query.page,
        limit: req.query.limit,
      }
    );

    return sendSuccess(res, 'Trips retrieved successfully', trips, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trip by ID
 */
export const getTripById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    return sendSuccess(res, 'Trip retrieved successfully', trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Get trip by slug
 */
export const getTripBySlug = async (req, res, next) => {
  try {
    const trip = await tripService.getTripBySlug(req.params.slug);
    return sendSuccess(res, 'Trip retrieved successfully', trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Increment trip view count (public, fire-and-forget from the detail page)
 */
export const incrementTripView = async (req, res, next) => {
  try {
    const views = await tripService.incrementTripViews(req.params.id);
    return sendSuccess(res, 'Trip view recorded', { views });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new trip
 */
export const createTrip = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body, req.user.id);
    return sendCreated(res, 'Trip created successfully', trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Update trip
 */
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body, req.user.id);
    return sendSuccess(res, 'Trip updated successfully', trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete trip
 */
export const deleteTrip = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id);
    return sendSuccess(res, 'Trip deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Duplicate trip
 */
export const duplicateTrip = async (req, res, next) => {
  try {
    const trip = await tripService.duplicateTrip(req.params.id, req.user.id);
    return sendCreated(res, 'Trip duplicated successfully', trip);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update trips
 */
export const bulkUpdateTrips = async (req, res, next) => {
  try {
    const { updates } = req.body;
    const result = await tripService.bulkUpdateTrips(updates);
    return sendSuccess(res, 'Trips updated successfully', result);
  } catch (error) {
    next(error);
  }
};
