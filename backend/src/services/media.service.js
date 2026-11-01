import Media from '../models/Media.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Get all media files with pagination
 */
export const getMediaFiles = async (filters = {}, pagination = {}) => {
  const { category, uploadedBy } = filters;
  const { page = 1, limit = 20 } = pagination;

  const query = {};
  if (category) query.category = category;
  if (uploadedBy) query.uploadedBy = uploadedBy;

  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('uploadedBy', 'name email'),
    Media.countDocuments(query),
  ]);

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get media file by ID
 */
export const getMediaFileById = async (fileId) => {
  const file = await Media.findById(fileId).populate('uploadedBy', 'name email');
  if (!file) {
    throw new Error('Media file not found');
  }
  return file;
};

/**
 * Create media file record
 */
export const createMediaFile = async (fileData, userId) => {
  const media = new Media({
    ...fileData,
    uploadedBy: userId,
  });
  await media.save();
  return media.populate('uploadedBy', 'name email');
};

/**
 * Delete media file
 */
export const deleteMediaFile = async (fileId) => {
  const file = await Media.findById(fileId);
  if (!file) {
    throw new Error('Media file not found');
  }

  // Delete physical file
  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  await Media.findByIdAndDelete(fileId);
  return file;
};

