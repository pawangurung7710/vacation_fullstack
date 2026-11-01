import * as navigationService from '../services/navigation.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all navigation items
 */
export const getNavigationItems = async (req, res, next) => {
  try {
    const items = await navigationService.getNavigationItems(req.query);
    return sendSuccess(res, 'Navigation items retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

/**
 * Get navigation item by ID
 */
export const getNavigationItemById = async (req, res, next) => {
  try {
    const item = await navigationService.getNavigationItemById(req.params.id);
    return sendSuccess(res, 'Navigation item retrieved successfully', item);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new navigation item
 */
export const createNavigationItem = async (req, res, next) => {
  try {
    const item = await navigationService.createNavigationItem(req.body);
    return sendCreated(res, 'Navigation item created successfully', item);
  } catch (error) {
    next(error);
  }
};

/**
 * Update navigation item
 */
export const updateNavigationItem = async (req, res, next) => {
  try {
    const item = await navigationService.updateNavigationItem(req.params.id, req.body);
    return sendSuccess(res, 'Navigation item updated successfully', item);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete navigation item
 */
export const deleteNavigationItem = async (req, res, next) => {
  try {
    await navigationService.deleteNavigationItem(req.params.id);
    return sendSuccess(res, 'Navigation item deleted successfully');
  } catch (error) {
    next(error);
  }
};

