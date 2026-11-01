import express from 'express';
import * as settingController from '../controllers/setting.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public route - storefront needs this to know whether to show the maintenance page
router.get('/', settingController.getSettings);

// Admin only routes
router.put('/maintenance-mode', authenticate, adminOnly, settingController.updateMaintenanceMode);
router.put('/instagram-embeds', authenticate, adminOnly, settingController.updateInstagramEmbeds);

export default router;
