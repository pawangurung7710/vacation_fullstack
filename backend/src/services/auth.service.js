import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { jwtConfig } from '../config/jwt.js';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  const { email, password, name, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Public self-registration always creates a plain 'user' account. Admin accounts
  // are provisioned separately (see seeds/users.seed.js) and must never be settable
  // via client-supplied input here, since that would let anyone self-promote to admin.
  const user = new User({
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    name,
    phone,
    role: 'user',
  });

  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password, loginMeta = {}) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  try {
    user.lastLoginAt = new Date();
    user.lastLoginAgent = loginMeta.userAgent || user.lastLoginAgent;
    await user.save();
  } catch (error) {
    // Ignore login metadata persistence failures
  }

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  // Verify user still exists and is active
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  // Generate new access token and rotate refresh token (sliding session)
  const accessToken = generateAccessToken(user._id, user.role);
  const nextRefreshToken = generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    user: user.toJSON(),
  };
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return null;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  return resetToken;
};

/**
 * Reset password
 */
export const resetPassword = async (token, newPassword) => {
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return user.toJSON();
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user.toJSON();
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (updates.email && updates.email !== user.email) {
    const existingUser = await User.findOne({ email: updates.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Email is already in use');
    }
  }

  const allowedFields = ['name', 'email', 'phone', 'title', 'avatarUrl'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  await user.save();
  return user.toJSON();
};

/**
 * Change user password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  user.passwordHash = newPassword;
  await user.save();

  return user.toJSON();
};

/**
 * Update user settings
 */
export const updateUserSettings = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const currentSettings = user.settings?.toObject ? user.settings.toObject() : user.settings || {};
  const nextTheme = {
    ...(currentSettings.theme || {}),
    ...(updates.theme || {}),
  };
  const nextPreferences = {
    ...(currentSettings.preferences || {}),
    ...(updates.preferences || {}),
  };

  user.settings = {
    ...currentSettings,
    ...updates,
    theme: nextTheme,
    preferences: nextPreferences,
  };

  await user.save();
  return user.toJSON();
};
