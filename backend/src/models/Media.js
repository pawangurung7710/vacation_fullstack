import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'Size is required'],
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    alt: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      default: 'image',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ mimeType: 1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;

