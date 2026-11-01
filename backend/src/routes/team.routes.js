import express from 'express';
import * as teamController from '../controllers/team.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, teamController.getTeamMembers);
router.get('/:id', optionalAuth, teamController.getTeamMemberById);

// Admin only routes
router.post('/', authenticate, adminOnly, teamController.createTeamMember);
router.put('/:id', authenticate, adminOnly, teamController.updateTeamMember);
router.delete('/:id', authenticate, adminOnly, teamController.deleteTeamMember);

export default router;

