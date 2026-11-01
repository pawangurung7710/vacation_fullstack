import mongoose from 'mongoose';

const navigationItemSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['link', 'dropdown', 'mega-menu'],
      default: 'link',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NavigationItem',
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NavigationItem',
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
navigationItemSchema.index({ parent: 1, order: 1 });
navigationItemSchema.index({ isActive: 1, order: 1 });

const NavigationItem = mongoose.model('NavigationItem', navigationItemSchema);

export default NavigationItem;

