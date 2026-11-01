import RentalCategory from '../models/RentalCategory.js';
import RentalProduct from '../models/RentalProduct.js';

export const getRentalCategories = async (filters = {}) => {
  const { isActive, search } = filters;
  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (search) {
    query.$or = [
      { label: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  return RentalCategory.find(query).sort({ order: 1, label: 1 });
};

export const getRentalCategoryById = async (categoryId) => {
  const category = await RentalCategory.findById(categoryId);
  if (!category) {
    throw new Error('Rental category not found');
  }
  return category;
};

export const getRentalCategoryBySlug = async (slug) => {
  const category = await RentalCategory.findOne({ slug });
  if (!category) {
    throw new Error('Rental category not found');
  }
  return category;
};

export const createRentalCategory = async (data) => {
  const category = new RentalCategory(data);
  await category.save();
  return category;
};

export const updateRentalCategory = async (categoryId, data) => {
  const category = await RentalCategory.findById(categoryId);
  if (!category) {
    throw new Error('Rental category not found');
  }
  Object.assign(category, data);
  await category.save();
  return category;
};

export const deleteRentalCategory = async (categoryId) => {
  const hasProducts = await RentalProduct.exists({ category: categoryId });
  if (hasProducts) {
    throw new Error('Cannot delete a category that has rental products');
  }

  const category = await RentalCategory.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error('Rental category not found');
  }
  return category;
};
