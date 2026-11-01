import mongoose from 'mongoose';
import * as rentalCategoryService from '../services/rentalCategory.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getRentalCategories = async (req, res, next) => {
  try {
    const categories = await rentalCategoryService.getRentalCategories(req.query);
    return sendSuccess(res, 'Rental categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/** Accepts either a slug (mobile app's category chips) or a Mongo _id (CMS edit page
 * prefill) at the same path, since both callers just want "the one category". */
export const getRentalCategoryByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const category = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? await rentalCategoryService.getRentalCategoryById(idOrSlug)
      : await rentalCategoryService.getRentalCategoryBySlug(idOrSlug);
    return sendSuccess(res, 'Rental category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const createRentalCategory = async (req, res, next) => {
  try {
    const category = await rentalCategoryService.createRentalCategory(req.body);
    return sendCreated(res, 'Rental category created successfully', category);
  } catch (error) {
    next(error);
  }
};

export const updateRentalCategory = async (req, res, next) => {
  try {
    const category = await rentalCategoryService.updateRentalCategory(req.params.id, req.body);
    return sendSuccess(res, 'Rental category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteRentalCategory = async (req, res, next) => {
  try {
    await rentalCategoryService.deleteRentalCategory(req.params.id);
    return sendSuccess(res, 'Rental category deleted successfully');
  } catch (error) {
    next(error);
  }
};
