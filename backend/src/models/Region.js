import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

regionSchema.index({ name: 1 });
regionSchema.index({ isActive: 1 });

export default mongoose.model('Region', regionSchema);
