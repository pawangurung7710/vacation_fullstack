import mongoose from 'mongoose';
import AddOn from '../models/AddOn.js';

/**
 * Get add-ons with optional filtering.
 * filters: { kind, status, scope, trip }
 * When `trip` is provided, returns global add-ons plus those explicitly attached to that trip.
 */
export const getAddOns = async (filters = {}) => {
  const query = {};

  if (filters.kind) query.kind = filters.kind;
  if (filters.status) query.status = filters.status;
  if (filters.scope) query.scope = filters.scope;

  if (filters.trip && mongoose.Types.ObjectId.isValid(filters.trip)) {
    query.$or = [{ scope: 'global' }, { trips: new mongoose.Types.ObjectId(filters.trip) }];
  }

  const addOns = await AddOn.find(query).sort({ order: 1, createdAt: -1 });
  return addOns;
};

/**
 * Get a single add-on by ID.
 */
export const getAddOnById = async (addOnId) => {
  const addOn = await AddOn.findById(addOnId);
  if (!addOn) {
    throw new Error('Add-on not found');
  }
  return addOn;
};

/**
 * Create a new add-on.
 */
export const createAddOn = async (data) => {
  const addOn = new AddOn(data);
  await addOn.save();
  return addOn;
};

/**
 * Update an add-on.
 */
export const updateAddOn = async (addOnId, updateData) => {
  const addOn = await AddOn.findById(addOnId);
  if (!addOn) {
    throw new Error('Add-on not found');
  }

  Object.assign(addOn, updateData);
  await addOn.save();
  return addOn;
};

/**
 * Delete an add-on. Bookings keep a snapshot of their add-ons, and trips
 * reference add-ons by id (a dangling ref is filtered out on read), so no
 * hard reference guard is required.
 */
export const deleteAddOn = async (addOnId) => {
  const addOn = await AddOn.findByIdAndDelete(addOnId);
  if (!addOn) {
    throw new Error('Add-on not found');
  }
  return addOn;
};
