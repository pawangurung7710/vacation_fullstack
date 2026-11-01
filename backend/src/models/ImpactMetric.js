import mongoose from 'mongoose';

const impactMetricSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Value is required'],
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['environmental', 'social', 'economic', 'cultural'],
      required: [true, 'Category is required'],
    },
    icon: {
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

// Indexes
impactMetricSchema.index({ category: 1, isActive: 1 });
impactMetricSchema.index({ order: 1 });

const ImpactMetric = mongoose.model('ImpactMetric', impactMetricSchema);

export default ImpactMetric;

