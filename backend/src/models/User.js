import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    lastLoginAt: Date,
    lastLoginAgent: String,
    settings: {
      theme: {
        mode: {
          type: String,
          enum: ['light', 'dark'],
          default: 'light',
        },
        accent: {
          type: String,
          enum: [
            'ocean',
            'forest',
            'sunset',
            'glacier',
            'midnight',
            'rose',
            'indigo',
            'teal',
            'yellow',
            'red',
            'sky',
            'peach',
            'plum',
            'mint',
            'cobalt',
            'sand',
          ],
          default: 'forest',
        },
        sidebarColor: {
          type: String,
          enum: [
            'ocean',
            'forest',
            'sunset',
            'glacier',
            'midnight',
            'rose',
            'indigo',
            'teal',
            'yellow',
            'red',
            'sky',
            'peach',
            'plum',
            'mint',
            'cobalt',
            'sand',
          ],
          default: 'midnight',
        },
        fontScale: {
          type: String,
          enum: ['small', 'normal', 'large'],
          default: 'normal',
        },
      },
      preferences: {
        compactTables: {
          type: Boolean,
          default: false,
        },
        reduceMotion: {
          type: Boolean,
          default: false,
        },
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Index for email lookups
userSchema.index({ email: 1 });

// Index for role-based queries
userSchema.index({ role: 1, isActive: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
