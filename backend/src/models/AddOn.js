import mongoose from 'mongoose';
import { generateSlug } from '../utils/slugify.js';

const addOnOptionSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    price: { type: Number, min: [0, 'Price must be positive'], default: 0 },
    priceUnit: { type: String, trim: true, default: '/pp' },
  },
  { _id: false }
);

const addOnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** 'comfort' = trip-detail comfort add-on / upgrade; 'activity' = bookable local adventure */
    kind: {
      type: String,
      enum: ['comfort', 'activity'],
      required: [true, 'Add-on kind is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    pricingType: {
      type: String,
      enum: ['flat', 'choice'],
      default: 'flat',
    },
    /** flat pricing — per person */
    price: {
      type: Number,
      min: [0, 'Price must be positive'],
    },
    priceUnit: {
      type: String,
      trim: true,
      default: 'per person',
    },
    /** choice pricing — one selectable option per booking */
    options: {
      type: [addOnOptionSchema],
      default: [],
    },
    duration: {
      type: String,
      trim: true,
    },
    activityType: {
      type: String,
      enum: ['Activity', 'Experience', 'Retreat', 'Workshop'],
      default: 'Activity',
    },
    location: {
      type: String,
      trim: true,
    },
    badges: [
      {
        type: String,
        trim: true,
      },
    ],
    /** eligible for the 10% multi add-on discount */
    discountEligible: {
      type: Boolean,
      default: true,
    },
    /** 'global' = offered on every trip; 'trips' = only the trips listed below */
    scope: {
      type: String,
      enum: ['global', 'trips'],
      default: 'global',
    },
    trips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

addOnSchema.index({ kind: 1, status: 1, order: 1 });

// Generate a slug from the title when missing / when the title changes.
addOnSchema.pre('save', function (next) {
  if (!this.slug || (this.isModified('title') && !this.isModified('slug'))) {
    this.slug = generateSlug(this.title);
  }
  next();
});

const AddOn = mongoose.model('AddOn', addOnSchema);

export default AddOn;
