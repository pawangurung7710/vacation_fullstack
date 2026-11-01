import ActionPlan from '../models/ActionPlan.js';

const throwNotFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const throwBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

export const getActionPlans = async () => {
  return ActionPlan.find().sort({ createdAt: -1 });
};

export const getActionPlanById = async (id) => {
  const plan = await ActionPlan.findById(id);
  if (!plan) {
    throwNotFound('Action plan not found');
  }
  return plan;
};

export const getActionPlanBySlug = async (slug) => {
  if (!slug || typeof slug !== 'string') {
    throwBadRequest('Action plan slug is required');
  }
  const plan = await ActionPlan.findOne({ slug });
  if (!plan) {
    throwNotFound('Action plan not found');
  }
  return plan;
};

export const createActionPlan = async (data) => {
  const plan = new ActionPlan(data);
  await plan.save();
  return plan;
};

export const updateActionPlan = async (id, updates) => {
  const plan = await ActionPlan.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!plan) {
    throwNotFound('Action plan not found');
  }
  return plan;
};

export const deleteActionPlan = async (id) => {
  const plan = await ActionPlan.findByIdAndDelete(id);
  if (!plan) {
    throwNotFound('Action plan not found');
  }
  return plan;
};
