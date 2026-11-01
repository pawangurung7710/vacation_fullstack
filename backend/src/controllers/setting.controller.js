import * as settingService from '../services/setting.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { extractInstagramPermalink } from '../utils/instagram.js';

/**
 * Get site settings
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingService.getSettings();
    return sendSuccess(res, 'Settings retrieved successfully', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update maintenance mode flag
 */
export const updateMaintenanceMode = async (req, res, next) => {
  try {
    const { maintenanceMode } = req.body;
    if (typeof maintenanceMode !== 'boolean') {
      return sendError(res, 400, 'maintenanceMode must be a boolean');
    }

    const settings = await settingService.updateMaintenanceMode(maintenanceMode, req.user.id);
    return sendSuccess(res, 'Maintenance mode updated successfully', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update the list of Instagram post permalinks featured on the maintenance page
 */
export const updateInstagramEmbeds = async (req, res, next) => {
  try {
    const { instagramEmbeds } = req.body;
    if (!Array.isArray(instagramEmbeds) || !instagramEmbeds.every((url) => typeof url === 'string')) {
      return sendError(res, 400, 'instagramEmbeds must be an array of strings');
    }

    // Accept either a bare permalink or a full pasted embed snippet - extract the real URL either way
    const cleaned = instagramEmbeds
      .map((url) => extractInstagramPermalink(url))
      .filter(Boolean);

    const settings = await settingService.updateInstagramEmbeds(cleaned, req.user.id);
    return sendSuccess(res, 'Instagram embeds updated successfully', settings);
  } catch (error) {
    next(error);
  }
};
