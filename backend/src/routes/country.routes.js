import express from 'express';
import * as countryController from '../controllers/country.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createCountrySchema,
  updateCountrySchema,
  countryQuerySchema,
} from '../validators/country.validator.js';

const router = express.Router();

router.get('/', optionalAuth, validate(countryQuerySchema), countryController.getCountries);
router.get('/:id', optionalAuth, countryController.getCountryById);

router.post('/', authenticate, adminOnly, validate(createCountrySchema), countryController.createCountry);
router.put('/:id', authenticate, adminOnly, validate(updateCountrySchema), countryController.updateCountry);
router.delete('/:id', authenticate, adminOnly, countryController.deleteCountry);

export default router;
