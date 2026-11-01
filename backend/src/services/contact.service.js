import ContactSubmission from '../models/ContactSubmission.js';

/**
 * Get all contact submissions with filtering and pagination
 */
export const getContactSubmissions = async (filters = {}, pagination = {}) => {
  const { status, search } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    ContactSubmission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('repliedBy', 'name email'),
    ContactSubmission.countDocuments(query),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get contact submission by ID
 */
export const getContactSubmissionById = async (submissionId) => {
  const submission = await ContactSubmission.findById(submissionId).populate('repliedBy', 'name email');
  if (!submission) {
    throw new Error('Contact submission not found');
  }
  return submission;
};

/**
 * Create new contact submission
 */
export const createContactSubmission = async (submissionData) => {
  const submission = new ContactSubmission(submissionData);
  await submission.save();
  return submission;
};

/**
 * Update contact submission
 */
export const updateContactSubmission = async (submissionId, updateData) => {
  const submission = await ContactSubmission.findById(submissionId);
  if (!submission) {
    throw new Error('Contact submission not found');
  }

  Object.assign(submission, updateData);
  await submission.save();

  return submission.populate('repliedBy', 'name email');
};

/**
 * Reply to contact submission
 */
export const replyToContactSubmission = async (submissionId, replyMessage, userId) => {
  const submission = await ContactSubmission.findById(submissionId);
  if (!submission) {
    throw new Error('Contact submission not found');
  }

  submission.replyMessage = replyMessage;
  submission.repliedBy = userId;
  submission.repliedAt = new Date();
  submission.status = 'replied';

  await submission.save();

  return submission.populate('repliedBy', 'name email');
};

/**
 * Delete contact submission
 */
export const deleteContactSubmission = async (submissionId) => {
  const submission = await ContactSubmission.findByIdAndDelete(submissionId);
  if (!submission) {
    throw new Error('Contact submission not found');
  }
  return submission;
};

