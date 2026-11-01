import * as rentalOrderService from '../services/rentalOrder.service.js';
import { generateRentalOrderToken, verifyRentalOrderToken } from '../utils/rental-order-token.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getRentalOrders = async (req, res, next) => {
  try {
    const { orders, pagination } = await rentalOrderService.getRentalOrders(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendSuccess(res, 'Rental orders retrieved successfully', orders, { pagination });
  } catch (error) {
    next(error);
  }
};

export const getMyRentalOrders = async (req, res, next) => {
  try {
    const { orders, pagination } = await rentalOrderService.getRentalOrdersForUser(
      req.user.id,
      { status: req.query.status, paymentStatus: req.query.paymentStatus },
      { page: req.query.page, limit: req.query.limit }
    );
    return sendSuccess(res, 'Rental orders retrieved successfully', orders, { pagination });
  } catch (error) {
    next(error);
  }
};

export const getMyRentalOrderById = async (req, res, next) => {
  try {
    const order = await rentalOrderService.getRentalOrderById(req.params.id);
    const ownerId = order.user?._id?.toString() || order.user?.toString();
    if (!ownerId || ownerId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Rental order not found' });
    }
    return sendSuccess(res, 'Rental order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const getRentalOrderById = async (req, res, next) => {
  try {
    const order = await rentalOrderService.getRentalOrderById(req.params.id);
    return sendSuccess(res, 'Rental order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

/** Public guest lookup, gated by the HMAC token handed back at order creation —
 * mirrors booking confirmation's token check, giving guests (no login) a way to view
 * their own order. */
export const getRentalOrderConfirmation = async (req, res, next) => {
  try {
    const order = await rentalOrderService.getRentalOrderById(req.params.id);
    const token = req.query.token;
    if (!verifyRentalOrderToken(token, order._id.toString())) {
      return res.status(404).json({ success: false, message: 'Rental order not found' });
    }
    return sendSuccess(res, 'Rental order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const createRentalOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const order = await rentalOrderService.createRentalOrder(req.body, userId);
    const orderResponse = order.toObject();
    orderResponse.confirmationToken = generateRentalOrderToken(order._id.toString());
    return sendCreated(res, 'Rental order created successfully', orderResponse);
  } catch (error) {
    next(error);
  }
};

export const updateRentalOrder = async (req, res, next) => {
  try {
    const order = await rentalOrderService.updateRentalOrder(req.params.id, req.body);
    return sendSuccess(res, 'Rental order updated successfully', order);
  } catch (error) {
    next(error);
  }
};

export const deleteRentalOrder = async (req, res, next) => {
  try {
    await rentalOrderService.deleteRentalOrder(req.params.id);
    return sendSuccess(res, 'Rental order deleted successfully');
  } catch (error) {
    next(error);
  }
};
