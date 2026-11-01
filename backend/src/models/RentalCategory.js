import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugify.js';

// Deliberately its own collection, decoupled from the trip Category model's
// parent/level hierarchy — rental gear categories are a flat, unrelated taxonomy.
const rentalCategorySchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
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

rentalCategorySchema.index({ slug: 1 }, { unique: true });
rentalCategorySchema.index({ isActive: 1, order: 1 });

rentalCategorySchema.pre('save', function (next) {
  if (this.isModified('label') && !this.isModified('slug')) {
    this.slug = generateSlug(this.label);
  }
  next();
});

const RentalCategory = mongoose.model('RentalCategory', rentalCategorySchema);

export default RentalCategory;
