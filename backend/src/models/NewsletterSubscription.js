import mongoose from 'mongoose';

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      trim: true,
      default: 'unknown',
    },
    status: {
      type: String,
      enum: ['subscribed', 'unsubscribed'],
      default: 'subscribed',
    },
    subscribedAt: {
      type: Date,
      default: () => new Date(),
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

newsletterSubscriptionSchema.index({ createdAt: -1 });

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

export default NewsletterSubscription;
