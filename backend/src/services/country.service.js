import Country from '../models/Country.js';

export const getCountries = async (filters = {}) => {
  const { search, isActive } = filters;
  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  return Country.find(query).sort({ name: 1 });
};

export const getCountryById = async (countryId) => {
  const country = await Country.findById(countryId);
  if (!country) {
    throw new Error('Country not found');
  }
  return country;
};

export const createCountry = async (data) => {
  const country = new Country({ name: data.name, isActive: data.isActive ?? true });
  await country.save();
  return country;
};

export const updateCountry = async (countryId, data) => {
  const country = await Country.findById(countryId);
  if (!country) {
    throw new Error('Country not found');
  }

  if (data.name !== undefined) {
    country.name = data.name;
  }
  if (data.isActive !== undefined) {
    country.isActive = data.isActive;
  }
  await country.save();
  return country;
};

export const deleteCountry = async (countryId) => {
  const country = await Country.findByIdAndDelete(countryId);
  if (!country) {
    throw new Error('Country not found');
  }
  return country;
};
