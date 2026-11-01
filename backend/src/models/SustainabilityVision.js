import mongoose from 'mongoose';

const sustainabilityVisionBlockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      required: [true, 'Block id is required'],
    },
    type: {
      type: String,
      enum: ['cards', 'bullets'],
      required: [true, 'Block type is required'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Block title is required'],
    },
    icon: {
      type: String,
      enum: ['target', 'users', 'heart', 'leaf'],
      required: [true, 'Block icon is required'],
    },
    theme: {
      type: String,
      enum: ['glacier', 'forest', 'purple', 'saffron'],
      required: [true, 'Block theme is required'],
    },
    intro: {
      type: [String],
      default: [],
    },
    initialVisibleCount: {
      type: Number,
      default: 6,
    },
    // items is intentionally flexible:
    // - for "cards": [{ title, description }]
    // - for "bullets": ["text", ...]
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const sustainabilityVisionSchema = new mongoose.Schema(
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
    subtitle: {
      type: String,
      trim: true,
      required: [true, 'Subtitle is required'],
    },
    blocks: {
      type: [sustainabilityVisionBlockSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

sustainabilityVisionSchema.index({ slug: 1 });

const SustainabilityVision = mongoose.model('SustainabilityVision', sustainabilityVisionSchema);

export default SustainabilityVision;

