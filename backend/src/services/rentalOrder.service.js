import RentalOrder from '../models/RentalOrder.js';
import RentalProduct from '../models/RentalProduct.js';
import { checkAvailability } from './rentalProduct.service.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const computeDays = (deliveryDate, returnDate) => {
  const days = Math.ceil((new Date(returnDate).getTime() - new Date(deliveryDate).getTime()) / MS_PER_DAY);
  return Math.max(days, 1);
};

/**
 * Re-prices every line item off the current product record and checks availability —
 * never trusts client-submitted prices/subtotals, same principle as booking creation
 * trusting the Trip record over client input.
 */
const buildOrderItems = async (items) => {
  const built = [];
  let totalPrice = 0;
  let depositTotal = 0;

  for (const item of items) {
    const product = await RentalProduct.findById(item.product);
    if (!product) {
      throw new Error(`Rental product ${item.product} not found`);
    }
    if (product.status !== 'published') {
      throw new Error(`${product.title} is not available for rent`);
    }

    const quantity = Number(item.quantity);
    const days = computeDays(item.deliveryDate, item.returnDate);
    if (days < product.minRentalDays) {
      throw new Error(`${product.title} requires a minimum rental of ${product.minRentalDays} day(s)`);
    }

    const availability = await checkAvailability(product._id, item.deliveryDate, item.returnDate, quantity);
    if (!availability.isAvailable) {
      throw new Error(`Only ${availability.available} unit(s) of ${product.title} available for those dates`);
    }

    const subtotal = product.pricePerDay * days * quantity;
    totalPrice += subtotal;
    depositTotal += (product.depositAmount || 0) * quantity;

    built.push({
      product: product._id,
      title: product.title,
      image: product.images?.[0],
      pricePerDay: product.pricePerDay,
      quantity,
      deliveryDate: new Date(item.deliveryDate),
      returnDate: new Date(item.returnDate),
      days,
      subtotal,
    });
  }

  return { items: built, totalPrice, depositTotal };
};

export const getRentalOrders = async (filters = {}, pagination = {}) => {
  const { status, paymentStatus, user } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (user) query.user = user;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    RentalOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    RentalOrder.countDocuments(query),
  ]);

  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getRentalOrdersForUser = async (userId, filters = {}, pagination = {}) => {
  const { status, paymentStatus } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = { user: userId };
  if (status) query.status = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    RentalOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    RentalOrder.countDocuments(query),
  ]);

  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getRentalOrderById = async (orderId) => {
  const order = await RentalOrder.findById(orderId).populate('user', 'name email');
  if (!order) {
    throw new Error('Rental order not found');
  }
  return order;
};

export const createRentalOrder = async (data, userId = null) => {
  const { items, totalPrice, depositTotal } = await buildOrderItems(data.items);

  const order = new RentalOrder({
    user: userId,
    guestInfo: data.guestInfo,
    items,
    deliveryMethod: data.deliveryMethod,
    deliveryAddress: data.deliveryAddress,
    totalPrice,
    depositTotal,
    consents: data.consents,
    notes: data.notes,
  });

  await order.save();
  return order;
};

export const updateRentalOrder = async (orderId, updateData) => {
  const order = await RentalOrder.findById(orderId);
  if (!order) {
    throw new Error('Rental order not found');
  }
  Object.assign(order, updateData);
  await order.save();
  return order;
};

export const deleteRentalOrder = async (orderId) => {
  const order = await RentalOrder.findByIdAndDelete(orderId);
  if (!order) {
    throw new Error('Rental order not found');
  }
  return order;
};
