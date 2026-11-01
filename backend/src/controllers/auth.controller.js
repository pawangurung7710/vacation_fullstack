import fs from 'fs';
import path from 'path';
import * as authService from '../services/auth.service.js';
import * as emailService from '../services/email.service.js';
import { sendSuccess, sendError, sendCreated } from '../utils/response.js';
import { optimizeImageInPlace } from '../utils/image-processing.js';

const uploadsDir = process.env.UPLOAD_DIR || 'uploads';

/** Best-effort delete of a previous avatar file when it's replaced. Only ever targets
 * files under our own uploads dir (by basename, ignoring any path segments in the
 * stored URL) so a user-supplied external avatarUrl (PATCH /auth/me accepts any URL)
 * can never make this touch an arbitrary path. Failure to delete is non-fatal — an
 * orphaned file is a minor cleanup issue, not worth failing the request over. */
function deleteAvatarFileIfLocal(avatarUrl) {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/')) return;
  const filePath = path.join(uploadsDir, path.basename(avatarUrl));
  fs.unlink(filePath, () => {});
}

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

    return sendCreated(res, 'User registered successfully', {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'] || '';
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password, {
      userAgent,
    });

    return sendSuccess(res, 'Login successful', {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (client should discard tokens)
 */
export const logout = async (req, res) => {
  return sendSuccess(res, 'Logout successful');
};

/**
 * Refresh access token
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken, refreshToken: nextRefreshToken, user } =
      await authService.refreshAccessToken(refreshToken);

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken,
      refreshToken: nextRefreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.generatePasswordResetToken(email);

    if (resetToken) {
      // Send email with reset token
      await emailService.sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to prevent email enumeration
    return sendSuccess(res, 'If an account exists, a password reset email has been sent');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await authService.resetPassword(token, password);

    return sendSuccess(res, 'Password reset successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return sendSuccess(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
export const updateMe = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload/replace the current user's avatar. Separate from updateMe so mobile can send a
 * multipart file directly rather than needing a pre-hosted URL; reuses the same
 * updateUserProfile service function that PATCH /auth/me already uses, unchanged.
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    try {
      // The mobile client already resizes before upload, but re-validate/re-process
      // server-side too (defense in depth against a modified client or a direct API
      // call) — also doubles as real content validation, not just extension/mimetype.
      await optimizeImageInPlace(req.file.path, req.file.mimetype, { maxDimension: 512 });
    } catch {
      await fs.promises.unlink(req.file.path).catch(() => {});
      return sendError(res, 400, 'Uploaded file is not a valid image.');
    }

    const previousUser = await authService.getUserById(req.user.id);
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await authService.updateUserProfile(req.user.id, { avatarUrl });
    deleteAvatarFileIfLocal(previousUser?.avatarUrl);
    return sendSuccess(res, 'Avatar updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Change current user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await authService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, 'Password updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const user = await authService.updateUserSettings(req.user.id, req.body);
    return sendSuccess(res, 'Settings updated successfully', { user });
  } catch (error) {
    next(error);
  }
};
