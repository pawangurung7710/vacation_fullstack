import * as actionPlanService from '../services/actionPlan.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const getActionPlans = async (req, res, next) => {
  try {
    const plans = await actionPlanService.getActionPlans();
    return sendSuccess(res, 'Action plans retrieved successfully', plans);
  } catch (error) {
    next(error);
  }
};

export const getActionPlanById = async (req, res, next) => {
  try {
    const plan = await actionPlanService.getActionPlanById(req.params.id);
    return sendSuccess(res, 'Action plan retrieved successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const getActionPlanBySlug = async (req, res, next) => {
  try {
    const plan = await actionPlanService.getActionPlanBySlug(req.params.slug);
    return sendSuccess(res, 'Action plan retrieved successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const createActionPlan = async (req, res, next) => {
  try {
    const plan = await actionPlanService.createActionPlan(req.body);
    return sendCreated(res, 'Action plan created successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const updateActionPlan = async (req, res, next) => {
  try {
    const plan = await actionPlanService.updateActionPlan(req.params.id, req.body);
    return sendSuccess(res, 'Action plan updated successfully', plan);
  } catch (error) {
    next(error);
  }
};

export const deleteActionPlan = async (req, res, next) => {
  try {
    await actionPlanService.deleteActionPlan(req.params.id);
    return sendSuccess(res, 'Action plan deleted successfully');
  } catch (error) {
    next(error);
  }
};
