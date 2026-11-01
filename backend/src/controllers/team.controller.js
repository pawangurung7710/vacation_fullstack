import * as teamService from '../services/team.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all team members
 */
export const getTeamMembers = async (req, res, next) => {
  try {
    const members = await teamService.getTeamMembers(req.query);
    return sendSuccess(res, 'Team members retrieved successfully', members);
  } catch (error) {
    next(error);
  }
};

/**
 * Get team member by ID
 */
export const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await teamService.getTeamMemberById(req.params.id);
    return sendSuccess(res, 'Team member retrieved successfully', member);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new team member
 */
export const createTeamMember = async (req, res, next) => {
  try {
    const member = await teamService.createTeamMember(req.body);
    return sendCreated(res, 'Team member created successfully', member);
  } catch (error) {
    next(error);
  }
};

/**
 * Update team member
 */
export const updateTeamMember = async (req, res, next) => {
  try {
    const member = await teamService.updateTeamMember(req.params.id, req.body);
    return sendSuccess(res, 'Team member updated successfully', member);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (req, res, next) => {
  try {
    await teamService.deleteTeamMember(req.params.id);
    return sendSuccess(res, 'Team member deleted successfully');
  } catch (error) {
    next(error);
  }
};

