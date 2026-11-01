import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugify.js';

const categorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Category label is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    heroImage: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('label') && !this.isModified('slug')) {
    this.slug = generateSlug(this.label);
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
