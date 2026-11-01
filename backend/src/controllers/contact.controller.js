import * as contactService from '../services/contact.service.js';
import * as emailService from '../services/email.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

/**
 * Get all contact submissions
 */
export const getContactSubmissions = async (req, res, next) => {
  try {
    const { submissions, pagination } = await contactService.getContactSubmissions(req.query, {
      page: req.query.page,
      limit: req.query.limit,
    });

    return sendSuccess(res, 'Contact submissions retrieved successfully', submissions, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contact submission by ID
 */
export const getContactSubmissionById = async (req, res, next) => {
  try {
    const submission = await contactService.getContactSubmissionById(req.params.id);
    return sendSuccess(res, 'Contact submission retrieved successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new contact submission
 */
export const createContactSubmission = async (req, res, next) => {
  try {
    const submission = await contactService.createContactSubmission(req.body);

    // Notify admin
    try {
      await emailService.sendContactSubmissionAdminEmail(submission);
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
    }

    // Send confirmation to sender
    try {
      await emailService.sendContactSubmissionReceiptEmail(submission);
    } catch (emailError) {
      console.error('Error sending contact submission receipt email:', emailError);
    }

    return sendCreated(res, 'Contact submission created successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact submission
 */
export const updateContactSubmission = async (req, res, next) => {
  try {
    const submission = await contactService.updateContactSubmission(req.params.id, req.body);
    return sendSuccess(res, 'Contact submission updated successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to contact submission
 */
export const replyToContactSubmission = async (req, res, next) => {
  try {
    const submission = await contactService.replyToContactSubmission(
      req.params.id,
      req.body.replyMessage,
      req.user.id
    );

    // Send reply email
    try {
      await emailService.sendContactReplyEmail(submission.email, submission.name, req.body.replyMessage);
    } catch (emailError) {
      console.error('Error sending reply email:', emailError);
    }

    return sendSuccess(res, 'Reply sent successfully', submission);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contact submission
 */
export const deleteContactSubmission = async (req, res, next) => {
  try {
    await contactService.deleteContactSubmission(req.params.id);
    return sendSuccess(res, 'Contact submission deleted successfully');
  } catch (error) {
    next(error);
  }
};
