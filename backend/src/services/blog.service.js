import BlogPost from '../models/BlogPost.js';
import { generateSlug } from '../utils/slugify.js';

const buildUniqueSlug = async (baseSlug, excludeId) => {
  const sanitized = baseSlug || '';
  if (!sanitized) return sanitized;

  const regex = new RegExp(`^${sanitized}(?:-(\\d+))?$`, 'i');
  const query = { slug: regex };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await BlogPost.find(query).select('slug').lean();
  if (!existing.length) return sanitized;

  let maxSuffix = 0;
  existing.forEach((post) => {
    const match = post.slug.match(regex);
    if (match && match[1]) {
      const suffix = parseInt(match[1], 10);
      if (!Number.isNaN(suffix)) {
        maxSuffix = Math.max(maxSuffix, suffix);
      }
    } else if (post.slug === sanitized) {
      maxSuffix = Math.max(maxSuffix, 1);
    }
  });

  return `${sanitized}-${maxSuffix + 1}`;
};

/**
 * Get all blog posts with filtering, pagination, and search
 */
export const getBlogPosts = async (filters = {}, pagination = {}, options = {}) => {
  const { status, category, featured, search, sort = 'publishedAt', order = 'desc' } = filters;
  const { page = 1, limit = 10 } = pagination;
  const { includeAll = false } = options;

  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured;
  if (!includeAll) {
    query.status = 'published';
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  const [posts, total] = await Promise.all([
    BlogPost.find(query).sort(sortObj).skip(skip).limit(limit).populate('author', 'name email'),
    BlogPost.countDocuments(query),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get blog post by ID
 */
export const getBlogPostById = async (postId, options = {}) => {
  const { includeAll = false } = options;
  const query = { _id: postId };
  if (!includeAll) {
    query.status = 'published';
  }
  const post = await BlogPost.findOne(query).populate('author', 'name email');
  if (!post) {
    throw new Error('Blog post not found');
  }
  return post;
};

/**
 * Get blog post by slug
 */
export const getBlogPostBySlug = async (slug) => {
  const post = await BlogPost.findOne({ slug, status: 'published' }).populate('author', 'name email');
  if (!post) {
    throw new Error('Blog post not found');
  }

  // Increment views
  post.views += 1;
  await post.save();

  return post;
};

/**
 * Create new blog post
 */
export const createBlogPost = async (postData, userId) => {
  const baseSlug = postData.slug ? generateSlug(postData.slug) : generateSlug(postData.title);
  const uniqueSlug = await buildUniqueSlug(baseSlug);

  const post = new BlogPost({
    ...postData,
    author: userId,
    slug: uniqueSlug,
  });

  await post.save();
  return post.populate('author', 'name email');
};

/**
 * Update blog post
 */
export const updateBlogPost = async (postId, updateData) => {
  const post = await BlogPost.findById(postId);
  if (!post) {
    throw new Error('Blog post not found');
  }

  if (updateData.title && updateData.title !== post.title) {
    const baseSlug = generateSlug(updateData.title);
    updateData.slug = await buildUniqueSlug(baseSlug, postId);
  } else if (updateData.slug && updateData.slug !== post.slug) {
    const baseSlug = generateSlug(updateData.slug);
    updateData.slug = await buildUniqueSlug(baseSlug, postId);
  }

  if (updateData.status === 'published' && !post.publishedAt) {
    updateData.publishedAt = new Date();
  }

  Object.assign(post, updateData);
  await post.save();

  return post.populate('author', 'name email');
};

/**
 * Delete blog post
 */
export const archiveBlogPost = async (postId) => {
  const post = await BlogPost.findById(postId);
  if (!post) {
    throw new Error('Blog post not found');
  }
  post.status = 'archived';
  await post.save();
  return post;
};

export const updateBlogStatus = async (postId, status) => {
  const post = await BlogPost.findById(postId);
  if (!post) {
    throw new Error('Blog post not found');
  }
  post.status = status;
  if (status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
  await post.save();
  return post.populate('author', 'name email');
};

export const updateBlogFeatured = async (postId, featured) => {
  const post = await BlogPost.findById(postId);
  if (!post) {
    throw new Error('Blog post not found');
  }
  post.featured = featured;
  await post.save();
  return post.populate('author', 'name email');
};

export const getFeaturedBlogPosts = async (limit) => {
  let query = BlogPost.find({ featured: true, status: 'published' })
    .sort({ publishedAt: -1 })
    .populate('author', 'name email');
  if (limit) {
    query = query.limit(limit);
  }
  return query;
};
