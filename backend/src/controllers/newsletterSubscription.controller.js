import * as newsletterSubscriptionService from '../services/newsletterSubscription.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const subscribe = async (req, res, next) => {
  try {
    const { subscription, created } = await newsletterSubscriptionService.subscribe(req.body);
    const message = created ? 'Subscription created successfully' : 'Already subscribed';
    return created
      ? sendCreated(res, message, subscription)
      : sendSuccess(res, message, subscription);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { subscriptions, pagination } = await newsletterSubscriptionService.getAll(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });
    return sendSuccess(res, 'Newsletter subscriptions retrieved successfully', subscriptions, { pagination });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const subscription = await newsletterSubscriptionService.getById(req.params.id);
    return sendSuccess(res, 'Newsletter subscription retrieved successfully', subscription);
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req, res, next) => {
  try {
    await newsletterSubscriptionService.deleteById(req.params.id);
    return sendSuccess(res, 'Newsletter subscription deleted successfully');
  } catch (error) {
    next(error);
  }
};

