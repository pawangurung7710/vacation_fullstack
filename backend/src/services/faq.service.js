import FaqCategory from '../models/FaqCategory.js';

export const getFaqCategories = async () => {
  return FaqCategory.find().sort({ order: 1, createdAt: 1 });
};

export const getFaqCategoryById = async (id) => {
  const category = await FaqCategory.findById(id);
  if (!category) {
    throw new Error('FAQ category not found');
  }
  return category;
};

export const createFaqCategory = async (data) => {
  const category = new FaqCategory(data);
  await category.save();
  return category;
};

export const updateFaqCategory = async (id, updates) => {
  const category = await FaqCategory.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new Error('FAQ category not found');
  }
  return category;
};

export const deleteFaqCategory = async (id) => {
  const category = await FaqCategory.findByIdAndDelete(id);
  if (!category) {
    throw new Error('FAQ category not found');
  }
  return category;
};
