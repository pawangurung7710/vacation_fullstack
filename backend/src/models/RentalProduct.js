import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugify.js';

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

// Mirrors Trip.js's draft/published pattern: most fields are only required once the
// product is actually published, so an admin can save an in-progress draft freely.
const rentalProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Title is required',
      ],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalCategory',
      required: [
        function () {
          return this.status === 'published';
        },
        'Category is required',
      ],
    },
    description: {
      type: String,
      required: [
        function () {
          return this.status === 'published';
        },
        'Description is required',
      ],
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    pricePerDay: {
      type: Number,
      required: [
        function () {
          return this.status === 'published';
        },
        'Price per day is required',
      ],
      min: [0, 'Price must be positive'],
    },
    depositAmount: {
      type: Number,
      min: [0, 'Deposit must be positive'],
      default: 0,
    },
    quantityTotal: {
      type: Number,
      required: [
        function () {
          return this.status === 'published';
        },
        'Quantity is required',
      ],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    sku: {
      type: String,
      trim: true,
    },
    specifications: [specificationSchema],
    minRentalDays: {
      type: Number,
      min: [1, 'Minimum rental days must be at least 1'],
      default: 1,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

rentalProductSchema.index({ slug: 1 });
rentalProductSchema.index({ category: 1, status: 1 });
rentalProductSchema.index({ featured: 1, status: 1 });
rentalProductSchema.index({ status: 1 });

rentalProductSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = generateSlug(this.title);
  }
  next();
});

const RentalProduct = mongoose.model('RentalProduct', rentalProductSchema);

export default RentalProduct;
