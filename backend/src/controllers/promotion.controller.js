import * as promotionService from '../services/promotion.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getPromotions = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
      search: req.query.search,
    };
    const promotions = await promotionService.getPromotions(filters);
    return sendSuccess(res, 'Promotions retrieved successfully', promotions);
  } catch (error) {
    next(error);
  }
};

export const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    return sendSuccess(res, 'Promotion retrieved successfully', promotion);
  } catch (error) {
    next(error);
  }
};

export const createPromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    return sendCreated(res, 'Promotion created successfully', promotion);
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const promotion = await promotionService.updatePromotion(req.params.id, req.body);
    return sendSuccess(res, 'Promotion updated successfully', promotion);
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    return sendSuccess(res, 'Promotion deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (req, res, next) => {
  try {
    const { code, tripId } = req.query;
    const promotion = await promotionService.validatePromoCode(code, tripId);
    return sendSuccess(res, 'Promo code is valid', promotion);
  } catch (error) {
    next(error);
  }
};
