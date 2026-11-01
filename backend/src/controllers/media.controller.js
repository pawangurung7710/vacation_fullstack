import * as mediaService from '../services/media.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all media files
 */
export const getMediaFiles = async (req, res, next) => {
  try {
    const { files, pagination } = await mediaService.getMediaFiles(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Media files retrieved successfully', files, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get media file by ID
 */
export const getMediaFileById = async (req, res, next) => {
  try {
    const file = await mediaService.getMediaFileById(req.params.id);
    return sendSuccess(res, 'Media file retrieved successfully', file);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete media file
 */
export const deleteMediaFile = async (req, res, next) => {
  try {
    await mediaService.deleteMediaFile(req.params.id);
    return sendSuccess(res, 'Media file deleted successfully');
  } catch (error) {
    next(error);
  }
};

