import Setting from '../models/Setting.js';

const SITE_KEY = 'site';

/**
 * Get site settings (creates default singleton if missing)
 */
export const getSettings = async () => {
  let settings = await Setting.findOne({ key: SITE_KEY });
  if (!settings) {
    settings = await Setting.create({ key: SITE_KEY });
  }
  return settings;
};

/**
 * Update maintenance mode flag
 */
export const updateMaintenanceMode = async (maintenanceMode, userId) => {
  const settings = await Setting.findOneAndUpdate(
    { key: SITE_KEY },
    { maintenanceMode, updatedBy: userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return settings;
};

/**
 * Update the list of Instagram post permalinks featured on the maintenance page
 */
export const updateInstagramEmbeds = async (instagramEmbeds, userId) => {
  const settings = await Setting.findOneAndUpdate(
    { key: SITE_KEY },
    { instagramEmbeds, updatedBy: userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return settings;
};
