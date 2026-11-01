import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: [true, 'Page key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    heroImage: {
      type: String,
      trim: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
pageContentSchema.index({ pageKey: 1 });

const PageContent = mongoose.model('PageContent', pageContentSchema);

export default PageContent;

