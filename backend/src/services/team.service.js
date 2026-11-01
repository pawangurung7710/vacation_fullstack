import TeamMember from '../models/TeamMember.js';

/**
 * Get all team members
 */
export const getTeamMembers = async (filters = {}) => {
  const query = {};
  if (Object.prototype.hasOwnProperty.call(filters, 'isActive')) {
    const isActiveRaw = filters.isActive;
    if (isActiveRaw === true || isActiveRaw === 'true') {
      query.isActive = true;
    } else if (isActiveRaw === false || isActiveRaw === 'false') {
      query.isActive = false;
    }
  }

  const members = await TeamMember.find(query).sort({ order: 1, createdAt: -1 });
  return members;
};

/**
 * Get team member by ID
 */
export const getTeamMemberById = async (memberId) => {
  const member = await TeamMember.findById(memberId);
  if (!member) {
    throw new Error('Team member not found');
  }
  return member;
};

/**
 * Create new team member
 */
export const createTeamMember = async (memberData) => {
  const member = new TeamMember(memberData);
  await member.save();
  return member;
};

/**
 * Update team member
 */
export const updateTeamMember = async (memberId, updateData) => {
  const member = await TeamMember.findById(memberId);
  if (!member) {
    throw new Error('Team member not found');
  }

  Object.assign(member, updateData);
  await member.save();
  return member;
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (memberId) => {
  const member = await TeamMember.findByIdAndDelete(memberId);
  if (!member) {
    throw new Error('Team member not found');
  }
  return member;
};
