import express from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotion.validator.js';

const router = express.Router();

router.get('/validate', promotionController.validatePromotion);
router.get('/', authenticate, adminOnly, promotionController.getPromotions);
router.post('/', authenticate, adminOnly, validate(createPromotionSchema), promotionController.createPromotion);
router.get('/:id', authenticate, adminOnly, promotionController.getPromotionById);
router.put('/:id', authenticate, adminOnly, validate(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:id', authenticate, adminOnly, promotionController.deletePromotion);

export default router;
