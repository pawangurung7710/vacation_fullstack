import * as addOnService from '../services/addOn.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all add-ons
 */
export const getAddOns = async (req, res, next) => {
  try {
    const addOns = await addOnService.getAddOns(req.query);
    return sendSuccess(res, 'Add-ons retrieved successfully', addOns);
  } catch (error) {
    next(error);
  }
};

/**
 * Get add-on by ID
 */
export const getAddOnById = async (req, res, next) => {
  try {
    const addOn = await addOnService.getAddOnById(req.params.id);
    return sendSuccess(res, 'Add-on retrieved successfully', addOn);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new add-on
 */
export const createAddOn = async (req, res, next) => {
  try {
    const addOn = await addOnService.createAddOn(req.body);
    return sendCreated(res, 'Add-on created successfully', addOn);
  } catch (error) {
    next(error);
  }
};

/**
 * Update add-on
 */
export const updateAddOn = async (req, res, next) => {
  try {
    const addOn = await addOnService.updateAddOn(req.params.id, req.body);
    return sendSuccess(res, 'Add-on updated successfully', addOn);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete add-on
 */
export const deleteAddOn = async (req, res, next) => {
  try {
    await addOnService.deleteAddOn(req.params.id);
    return sendSuccess(res, 'Add-on deleted successfully');
  } catch (error) {
    next(error);
  }
};
