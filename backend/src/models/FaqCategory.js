import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      trim: true,
      required: [true, 'Question is required'],
    },
    answer: {
      type: String,
      trim: true,
      required: [true, 'Answer is required'],
    },
  },
  { _id: false }
);

const faqCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Title is required'],
    },
    icon: {
      type: String,
      trim: true,
      default: '❓',
    },
    order: {
      type: Number,
      default: 0,
    },
    faqs: {
      type: [faqItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

faqCategorySchema.index({ order: 1, createdAt: 1 });

const FaqCategory = mongoose.model('FaqCategory', faqCategorySchema);

export default FaqCategory;
