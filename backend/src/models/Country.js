import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
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

countrySchema.index({ name: 1 });
countrySchema.index({ isActive: 1 });

export default mongoose.model('Country', countrySchema);
