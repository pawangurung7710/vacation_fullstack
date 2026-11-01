import ImpactMetric from '../models/ImpactMetric.js';

/**
 * Get all impact metrics
 */
export const getImpactMetrics = async (filters = {}) => {
  const { category, isActive = true } = filters;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive;
  if (category) query.category = category;

  const metrics = await ImpactMetric.find(query).sort({ order: 1, createdAt: -1 });
  return metrics;
};

/**
 * Get impact metric by ID
 */
export const getImpactMetricById = async (metricId) => {
  const metric = await ImpactMetric.findById(metricId);
  if (!metric) {
    throw new Error('Impact metric not found');
  }
  return metric;
};

/**
 * Create new impact metric
 */
export const createImpactMetric = async (metricData) => {
  const metric = new ImpactMetric(metricData);
  await metric.save();
  return metric;
};

/**
 * Update impact metric
 */
export const updateImpactMetric = async (metricId, updateData) => {
  const metric = await ImpactMetric.findById(metricId);
  if (!metric) {
    throw new Error('Impact metric not found');
  }

  Object.assign(metric, updateData);
  await metric.save();
  return metric;
};

/**
 * Delete impact metric
 */
export const deleteImpactMetric = async (metricId) => {
  const metric = await ImpactMetric.findByIdAndDelete(metricId);
  if (!metric) {
    throw new Error('Impact metric not found');
  }
  return metric;
};

