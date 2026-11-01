import mongoose from 'mongoose';
import Promotion from '../models/Promotion.js';

const buildFilters = ({ type, active, search } = {}) => {
  const query = {};

  if (type) {
    query.type = type;
  }

  if (typeof active === 'boolean') {
    query.isActive = active;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [{ code: regex }, { title: regex }, { description: regex }];
  }

  return query;
};

export const getPromotions = async (filters = {}) => {
  const query = buildFilters(filters);
  return Promotion.find(query)
    .sort({ createdAt: -1 })
    .populate('trip', 'title slug');
};

export const getPromotionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid promotion ID');
    error.statusCode = 400;
    throw error;
  }
  const promotion = await Promotion.findById(id).populate('trip', 'title slug');
  if (!promotion) {
    const error = new Error('Promotion not found');
    error.statusCode = 404;
    throw error;
  }
  return promotion;
};

export const createPromotion = async (data) => {
  const payload = {
    ...data,
    code: data.code?.toUpperCase?.() || data.code,
  };
  const promotion = new Promotion(payload);
  await promotion.save();
  return promotion.populate('trip', 'title slug');
};

export const updatePromotion = async (id, data) => {
  const promotion = await Promotion.findById(id);
  if (!promotion) {
    const error = new Error('Promotion not found');
    error.statusCode = 404;
    throw error;
  }
  if (data.code) {
    data.code = data.code.toUpperCase();
  }
  Object.assign(promotion, data);
  await promotion.save();
  return promotion.populate('trip', 'title slug');
};

export const deletePromotion = async (id) => {
  const promotion = await Promotion.findByIdAndDelete(id);
  if (!promotion) {
    const error = new Error('Promotion not found');
    error.statusCode = 404;
    throw error;
  }
  return promotion;
};

const throwValidationError = (message, status = 400) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

export const validatePromoCode = async (code, tripId) => {
  if (!code) {
    throwValidationError('Promo code is required');
  }

  const normalized = code.toUpperCase();
  const promotion = await Promotion.findOne({ code: normalized }).populate('trip', 'title slug');

  if (!promotion || !promotion.isActive) {
    throwValidationError('Promo code is not valid or has been deactivated');
  }

  const now = new Date();
  if (promotion.validFrom && promotion.validFrom > now) {
    throwValidationError('Promo code is not active yet');
  }

  if (promotion.validUntil && promotion.validUntil < now) {
    throwValidationError('Promo code has expired');
  }

  if (promotion.type === 'trip') {
    if (!tripId) {
      throwValidationError('Trip ID is required for this promo');
    }
    if (promotion.trip?.toString() !== tripId.toString()) {
      throwValidationError('Promo code is not valid for this trip');
    }
  }

  return promotion;
};
