import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true,
      required: [true, 'Action text is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const actionCardSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      required: [true, 'Card key is required'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Card title is required'],
    },
    theme: {
      type: String,
      enum: ['forest', 'glacier'],
      required: [true, 'Card theme is required'],
    },
    icon: {
      type: String,
      trim: true,
      default: 'social',
    },
    order: {
      type: Number,
      default: 0,
    },
    actions: {
      type: [actionItemSchema],
      default: [],
    },
  },
  { _id: false }
);

const actionPlanSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      trim: true,
      required: [true, 'Slug is required'],
      unique: true,
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Title is required'],
    },
    cards: {
      type: [actionCardSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

actionPlanSchema.index({ slug: 1 });

const ActionPlan = mongoose.model('ActionPlan', actionPlanSchema);

export default ActionPlan;
