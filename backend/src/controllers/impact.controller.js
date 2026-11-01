import * as impactService from '../services/impact.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all impact metrics
 */
export const getImpactMetrics = async (req, res, next) => {
  try {
    const metrics = await impactService.getImpactMetrics(req.query);
    return sendSuccess(res, 'Impact metrics retrieved successfully', metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get impact metric by ID
 */
export const getImpactMetricById = async (req, res, next) => {
  try {
    const metric = await impactService.getImpactMetricById(req.params.id);
    return sendSuccess(res, 'Impact metric retrieved successfully', metric);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new impact metric
 */
export const createImpactMetric = async (req, res, next) => {
  try {
    const metric = await impactService.createImpactMetric(req.body);
    return sendCreated(res, 'Impact metric created successfully', metric);
  } catch (error) {
    next(error);
  }
};

/**
 * Update impact metric
 */
export const updateImpactMetric = async (req, res, next) => {
  try {
    const metric = await impactService.updateImpactMetric(req.params.id, req.body);
    return sendSuccess(res, 'Impact metric updated successfully', metric);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete impact metric
 */
export const deleteImpactMetric = async (req, res, next) => {
  try {
    await impactService.deleteImpactMetric(req.params.id);
    return sendSuccess(res, 'Impact metric deleted successfully');
  } catch (error) {
    next(error);
  }
};

