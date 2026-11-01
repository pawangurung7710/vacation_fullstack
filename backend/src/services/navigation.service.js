import NavigationItem from '../models/NavigationItem.js';

/**
 * Get all navigation items (tree structure)
 */
export const getNavigationItems = async (filters = {}) => {
  const { isActive = true } = filters;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive;

  const items = await NavigationItem.find(query)
    .sort({ order: 1, createdAt: 1 })
    .populate('children')
    .populate('parent');

  // Build tree structure
  const rootItems = items.filter((item) => !item.parent);
  const buildTree = (parentId) => {
    return items
      .filter((item) => item.parent && item.parent._id.toString() === parentId)
      .map((item) => ({
        ...item.toObject(),
        children: buildTree(item._id.toString()),
      }));
  };

  return rootItems.map((item) => ({
    ...item.toObject(),
    children: buildTree(item._id.toString()),
  }));
};

/**
 * Get navigation item by ID
 */
export const getNavigationItemById = async (itemId) => {
  const item = await NavigationItem.findById(itemId).populate('parent').populate('children');
  if (!item) {
    throw new Error('Navigation item not found');
  }
  return item;
};

/**
 * Create new navigation item
 */
export const createNavigationItem = async (itemData) => {
  const item = new NavigationItem(itemData);
  await item.save();
  return item;
};

/**
 * Update navigation item
 */
export const updateNavigationItem = async (itemId, updateData) => {
  const item = await NavigationItem.findById(itemId);
  if (!item) {
    throw new Error('Navigation item not found');
  }

  Object.assign(item, updateData);
  await item.save();
  return item.populate('parent').populate('children');
};

/**
 * Delete navigation item
 */
export const deleteNavigationItem = async (itemId) => {
  const item = await NavigationItem.findByIdAndDelete(itemId);
  if (!item) {
    throw new Error('Navigation item not found');
  }
  return item;
};

