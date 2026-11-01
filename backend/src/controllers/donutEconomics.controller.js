import * as donutService from '../services/donutEconomics.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const getDonutSegments = async (req, res, next) => {
  try {
    const segments = await donutService.getDonutSegments();
    return sendSuccess(res, 'Donut segments retrieved successfully', segments);
  } catch (error) {
    next(error);
  }
};

export const getDonutSegmentById = async (req, res, next) => {
  try {
    const segment = await donutService.getDonutSegmentById(req.params.id);
    return sendSuccess(res, 'Donut segment retrieved successfully', segment);
  } catch (error) {
    next(error);
  }
};

export const createDonutSegment = async (req, res, next) => {
  try {
    const segment = await donutService.createDonutSegment(req.body);
    return sendCreated(res, 'Donut segment created successfully', segment);
  } catch (error) {
    next(error);
  }
};

export const updateDonutSegment = async (req, res, next) => {
  try {
    const segment = await donutService.updateDonutSegment(req.params.id, req.body);
    return sendSuccess(res, 'Donut segment updated successfully', segment);
  } catch (error) {
    next(error);
  }
};

export const deleteDonutSegment = async (req, res, next) => {
  try {
    await donutService.deleteDonutSegment(req.params.id);
    return sendSuccess(res, 'Donut segment deleted successfully');
  } catch (error) {
    next(error);
  }
};
