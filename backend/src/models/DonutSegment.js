import mongoose from 'mongoose';

const donutSegmentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      required: [true, 'Segment key is required'],
    },
    label: {
      type: String,
      trim: true,
      required: [true, 'Label is required'],
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
      min: 0,
      max: 100,
    },
    kpi: {
      type: String,
      trim: true,
      default: '',
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
    },
    ring: {
      type: String,
      enum: ['social', 'planetary'],
      required: [true, 'Ring is required'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
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

donutSegmentSchema.index({ key: 1 }, { unique: true });
donutSegmentSchema.index({ ring: 1, order: 1, createdAt: 1 });

const DonutSegment = mongoose.model('DonutSegment', donutSegmentSchema);

export default DonutSegment;
