import express from 'express';
import * as addOnController from '../controllers/addOn.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import { createAddOnSchema, updateAddOnSchema, addOnQuerySchema } from '../validators/addOn.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, validate(addOnQuerySchema), addOnController.getAddOns);
router.get('/:id', optionalAuth, addOnController.getAddOnById);

// Admin only routes
router.post('/', authenticate, adminOnly, validate(createAddOnSchema), addOnController.createAddOn);
router.put('/:id', authenticate, adminOnly, validate(updateAddOnSchema), addOnController.updateAddOn);
router.delete('/:id', authenticate, adminOnly, addOnController.deleteAddOn);

export default router;
