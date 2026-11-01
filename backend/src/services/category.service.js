import Category from '../models/Category.js';

export const getCategories = async (filters = {}) => {
  const { parent, level, isActive, search } = filters;
  const query = {};

  if (parent !== undefined) {
    if (parent === 'null' || parent === null) {
      query.parent = null;
    } else {
      query.parent = parent;
    }
  }

  if (level !== undefined) {
    query.level = Number(level);
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (search) {
    query.$or = [
      { label: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  return Category.find(query)
    .sort({ order: 1, label: 1 })
    .populate('parent', 'label slug');
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).populate('parent', 'label slug');
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

export const createCategory = async (data) => {
  const payload = { ...data };
  if (payload.parent && payload.level === undefined) {
    payload.level = 1;
  }
  if (!payload.parent && payload.level === undefined) {
    payload.level = 0;
  }
  const category = new Category(payload);
  await category.save();
  return category.populate('parent', 'label slug');
};

export const updateCategory = async (categoryId, data) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  const update = { ...data };
  if (update.parent !== undefined) {
    update.level = update.parent ? 1 : 0;
  }

  Object.assign(category, update);
  await category.save();
  return category.populate('parent', 'label slug');
};

export const deleteCategory = async (categoryId) => {
  const hasChildren = await Category.exists({ parent: categoryId });
  if (hasChildren) {
    throw new Error('Cannot delete a category with subcategories');
  }

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};
