import Country from '../models/Country.js';
import * as countryService from '../services/country.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeName = (value) => (typeof value === 'string' ? value.trim() : '');

export const getCountries = async (req, res, next) => {
  try {
    const countries = await countryService.getCountries(req.query);
    return sendSuccess(res, 'Countries retrieved successfully', countries);
  } catch (error) {
    next(error);
  }
};

export const getCountryById = async (req, res, next) => {
  try {
    const country = await countryService.getCountryById(req.params.id);
    return sendSuccess(res, 'Country retrieved successfully', country);
  } catch (error) {
    next(error);
  }
};

export const createCountry = async (req, res, next) => {
  try {
    const name = normalizeName(req.body?.name);
    if (name) {
      const existing = await Country.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
      if (existing) {
        return next({ statusCode: 409, message: 'Country name already exists' });
      }
    }
    const country = await countryService.createCountry(req.body);
    return sendCreated(res, 'Country created successfully', country);
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const name = normalizeName(req.body?.name);
    if (name) {
      const existing = await Country.findOne({
        name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return next({ statusCode: 409, message: 'Country name already exists' });
      }
    }
    const country = await countryService.updateCountry(req.params.id, req.body);
    return sendSuccess(res, 'Country updated successfully', country);
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    await countryService.deleteCountry(req.params.id);
    return sendSuccess(res, 'Country deleted successfully');
  } catch (error) {
    next(error);
  }
};
