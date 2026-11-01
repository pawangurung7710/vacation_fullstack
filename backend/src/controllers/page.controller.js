import * as pageService from '../services/page.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all page contents
 */
export const getPageContents = async (req, res, next) => {
  try {
    const pages = await pageService.getPageContents();
    return sendSuccess(res, 'Page contents retrieved successfully', pages);
  } catch (error) {
    next(error);
  }
};

/**
 * Get page content by key
 */
export const getPageContentByKey = async (req, res, next) => {
  try {
    const page = await pageService.getPageContentByKey(req.params.key);
    return sendSuccess(res, 'Page content retrieved successfully', page);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new page content
 */
export const createPageContent = async (req, res, next) => {
  try {
    const page = await pageService.createPageContent(req.body);
    return sendCreated(res, 'Page content created successfully', page);
  } catch (error) {
    next(error);
  }
};

/**
 * Update page content
 */
export const updatePageContent = async (req, res, next) => {
  try {
    const page = await pageService.updatePageContent(req.params.key, req.body, req.user.id);
    return sendSuccess(res, 'Page content updated successfully', page);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete page content
 */
export const deletePageContent = async (req, res, next) => {
  try {
    await pageService.deletePageContent(req.params.key);
    return sendSuccess(res, 'Page content deleted successfully');
  } catch (error) {
    next(error);
  }
};

