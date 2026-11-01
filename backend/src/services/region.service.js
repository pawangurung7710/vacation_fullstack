import Region from '../models/Region.js';

export const getRegions = async (filters = {}) => {
  const { search, isActive } = filters;
  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  return Region.find(query).sort({ name: 1 });
};

export const getRegionById = async (regionId) => {
  const region = await Region.findById(regionId);
  if (!region) {
    throw new Error('Region not found');
  }
  return region;
};

export const createRegion = async (data) => {
  const region = new Region({ name: data.name, isActive: data.isActive ?? true });
  await region.save();
  return region;
};

export const updateRegion = async (regionId, data) => {
  const region = await Region.findById(regionId);
  if (!region) {
    throw new Error('Region not found');
  }

  if (data.name !== undefined) {
    region.name = data.name;
  }
  if (data.isActive !== undefined) {
    region.isActive = data.isActive;
  }
  await region.save();
  return region;
};

export const deleteRegion = async (regionId) => {
  const region = await Region.findByIdAndDelete(regionId);
  if (!region) {
    throw new Error('Region not found');
  }
  return region;
};
