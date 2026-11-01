import * as rentalProductService from '../services/rentalProduct.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getRentalProducts = async (req, res, next) => {
  try {
    const { products, pagination } = await rentalProductService.getRentalProducts(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendSuccess(res, 'Rental products retrieved successfully', products, { pagination });
  } catch (error) {
    next(error);
  }
};

export const getRentalProductBySlug = async (req, res, next) => {
  try {
    const product = await rentalProductService.getRentalProductBySlug(req.params.slug);
    return sendSuccess(res, 'Rental product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getRentalProductById = async (req, res, next) => {
  try {
    const product = await rentalProductService.getRentalProductById(req.params.id);
    return sendSuccess(res, 'Rental product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getRentalProductAvailability = async (req, res, next) => {
  try {
    const { deliveryDate, returnDate, quantity } = req.query;
    const result = await rentalProductService.checkAvailability(
      req.params.id,
      deliveryDate,
      returnDate,
      quantity ? Number(quantity) : 1
    );
    return sendSuccess(res, 'Availability retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const incrementRentalProductView = async (req, res, next) => {
  try {
    const result = await rentalProductService.incrementView(req.params.id);
    return sendSuccess(res, 'View recorded', result);
  } catch (error) {
    next(error);
  }
};

export const createRentalProduct = async (req, res, next) => {
  try {
    const product = await rentalProductService.createRentalProduct(req.body, req.user.id);
    return sendCreated(res, 'Rental product created successfully', product);
  } catch (error) {
    next(error);
  }
};

export const updateRentalProduct = async (req, res, next) => {
  try {
    const product = await rentalProductService.updateRentalProduct(req.params.id, req.body);
    return sendSuccess(res, 'Rental product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

export const deleteRentalProduct = async (req, res, next) => {
  try {
    await rentalProductService.deleteRentalProduct(req.params.id);
    return sendSuccess(res, 'Rental product deleted successfully');
  } catch (error) {
    next(error);
  }
};
