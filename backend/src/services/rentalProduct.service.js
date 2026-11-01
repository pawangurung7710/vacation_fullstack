import RentalProduct from '../models/RentalProduct.js';
import RentalOrder from '../models/RentalOrder.js';
import RentalCategory from '../models/RentalCategory.js';

const POPULATE_CATEGORY = 'category';

export const getRentalProducts = async (filters = {}, pagination = {}) => {
  const { category, categorySlug, status, featured, search, minPrice, maxPrice, sort = 'createdAt', order = 'desc' } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  // Default to published products only, same as Trip — admins pass status=all/draft/etc.
  if (status === 'all') {
    // no status filter, for CMS views
  } else if (status) {
    query.status = status;
  } else {
    query.status = 'published';
  }

  if (category) query.category = category;
  if (categorySlug) {
    const categoryDoc = await RentalCategory.findOne({ slug: categorySlug });
    query.category = categoryDoc ? categoryDoc._id : null;
  }
  if (featured !== undefined) query.featured = featured;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.pricePerDay = {};
    if (minPrice !== undefined) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.pricePerDay.$lte = Number(maxPrice);
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    RentalProduct.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate(POPULATE_CATEGORY, 'label slug'),
    RentalProduct.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getRentalProductById = async (productId) => {
  const product = await RentalProduct.findById(productId).populate(POPULATE_CATEGORY, 'label slug');
  if (!product) {
    throw new Error('Rental product not found');
  }
  return product;
};

export const getRentalProductBySlug = async (slug) => {
  const product = await RentalProduct.findOne({ slug }).populate(POPULATE_CATEGORY, 'label slug');
  if (!product) {
    throw new Error('Rental product not found');
  }
  return product;
};

export const createRentalProduct = async (data, userId) => {
  const product = new RentalProduct({ ...data, createdBy: userId });
  await product.save();
  return product.populate(POPULATE_CATEGORY, 'label slug');
};

export const updateRentalProduct = async (productId, data) => {
  const product = await RentalProduct.findById(productId);
  if (!product) {
    throw new Error('Rental product not found');
  }
  Object.assign(product, data);
  await product.save();
  return product.populate(POPULATE_CATEGORY, 'label slug');
};

export const deleteRentalProduct = async (productId) => {
  const product = await RentalProduct.findByIdAndDelete(productId);
  if (!product) {
    throw new Error('Rental product not found');
  }
  return product;
};

/**
 * Sums reserved quantity across all non-cancelled orders' line items for this product
 * whose [deliveryDate, returnDate) window overlaps the requested one, and checks that
 * against the product's fleet size. No transactional hold — a known MVP limitation, same
 * class of race condition Trip's seat counter already has without one.
 */
export const checkAvailability = async (productId, deliveryDate, returnDate, quantity = 1) => {
  const product = await RentalProduct.findById(productId);
  if (!product) {
    throw new Error('Rental product not found');
  }

  const requestedStart = new Date(deliveryDate);
  const requestedEnd = new Date(returnDate);

  const overlapping = await RentalOrder.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $match: {
        'items.product': product._id,
        'items.deliveryDate': { $lt: requestedEnd },
        'items.returnDate': { $gt: requestedStart },
      },
    },
    { $group: { _id: null, reserved: { $sum: '$items.quantity' } } },
  ]);

  const reserved = overlapping[0]?.reserved ?? 0;
  const available = Math.max(product.quantityTotal - reserved, 0);

  return {
    productId: product._id,
    quantityTotal: product.quantityTotal,
    reserved,
    available,
    requestedQuantity: quantity,
    isAvailable: available >= quantity,
  };
};

export const incrementView = async (productId) => {
  const product = await RentalProduct.findByIdAndUpdate(productId, { $inc: { views: 1 } }, { new: true });
  if (!product) {
    throw new Error('Rental product not found');
  }
  return { views: product.views };
};
