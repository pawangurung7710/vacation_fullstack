import express from 'express';
import * as contactController from '../controllers/contact.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../validators/validator.js';
import {
  createContactSubmissionSchema,
  replyContactSchema,
  contactQuerySchema,
} from '../validators/contact.validator.js';

const router = express.Router();

// Public route
router.post('/', validate(createContactSubmissionSchema), contactController.createContactSubmission);

// Admin only routes
router.get('/', authenticate, adminOnly, validate(contactQuerySchema), contactController.getContactSubmissions);
router.get('/:id', authenticate, adminOnly, contactController.getContactSubmissionById);
router.put('/:id', authenticate, adminOnly, contactController.updateContactSubmission);
router.post('/:id/reply', authenticate, adminOnly, validate(replyContactSchema), contactController.replyToContactSubmission);
router.delete('/:id', authenticate, adminOnly, contactController.deleteContactSubmission);

export default router;

