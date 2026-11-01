import Region from '../models/Region.js';
import * as regionService from '../services/region.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeName = (value) => (typeof value === 'string' ? value.trim() : '');

export const getRegions = async (req, res, next) => {
  try {
    const regions = await regionService.getRegions(req.query);
    return sendSuccess(res, 'Regions retrieved successfully', regions);
  } catch (error) {
    next(error);
  }
};

export const getRegionById = async (req, res, next) => {
  try {
    const region = await regionService.getRegionById(req.params.id);
    return sendSuccess(res, 'Region retrieved successfully', region);
  } catch (error) {
    next(error);
  }
};

export const createRegion = async (req, res, next) => {
  try {
    const name = normalizeName(req.body?.name);
    if (name) {
      const existing = await Region.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
      if (existing) {
        return next({ statusCode: 409, message: 'Region name already exists' });
      }
    }
    const region = await regionService.createRegion(req.body);
    return sendCreated(res, 'Region created successfully', region);
  } catch (error) {
    next(error);
  }
};

export const updateRegion = async (req, res, next) => {
  try {
    const name = normalizeName(req.body?.name);
    if (name) {
      const existing = await Region.findOne({
        name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return next({ statusCode: 409, message: 'Region name already exists' });
      }
    }
    const region = await regionService.updateRegion(req.params.id, req.body);
    return sendSuccess(res, 'Region updated successfully', region);
  } catch (error) {
    next(error);
  }
};

export const deleteRegion = async (req, res, next) => {
  try {
    await regionService.deleteRegion(req.params.id);
    return sendSuccess(res, 'Region deleted successfully');
  } catch (error) {
    next(error);
  }
};
