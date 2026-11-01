import * as faqService from '../services/faq.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const getFaqCategories = async (req, res, next) => {
  try {
    const categories = await faqService.getFaqCategories();
    return sendSuccess(res, 'FAQ categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getFaqCategoryById = async (req, res, next) => {
  try {
    const category = await faqService.getFaqCategoryById(req.params.id);
    return sendSuccess(res, 'FAQ category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const createFaqCategory = async (req, res, next) => {
  try {
    const category = await faqService.createFaqCategory(req.body);
    return sendCreated(res, 'FAQ category created successfully', category);
  } catch (error) {
    next(error);
  }
};

export const updateFaqCategory = async (req, res, next) => {
  try {
    const category = await faqService.updateFaqCategory(req.params.id, req.body);
    return sendSuccess(res, 'FAQ category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteFaqCategory = async (req, res, next) => {
  try {
    await faqService.deleteFaqCategory(req.params.id);
    return sendSuccess(res, 'FAQ category deleted successfully');
  } catch (error) {
    next(error);
  }
};
