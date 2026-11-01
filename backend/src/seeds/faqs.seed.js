import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import FaqCategory from '../models/FaqCategory.js';

dotenv.config();

const faqCategories = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../data/faqs.json'), 'utf-8'));

const seedFaqs = async () => {
  await connectDB();
  const shouldClean = process.argv.includes('--clean');

  if (shouldClean) {
    await FaqCategory.deleteMany({});
    console.log('Cleared existing FAQ categories.');
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const [index, category] of faqCategories.entries()) {
    const payload = {
      ...category,
      order: index,
    };

    const existing = await FaqCategory.findOne({ title: category.title });
    if (existing) {
      await FaqCategory.updateOne({ _id: existing._id }, payload);
      updatedCount += 1;
    } else {
      await FaqCategory.create(payload);
      createdCount += 1;
    }
  }

  console.log(`FAQ seed complete. Created: ${createdCount}, Updated: ${updatedCount}.`);
  process.exit(0);
};

seedFaqs().catch((error) => {
  console.error('FAQ seed failed:', error);
  process.exit(1);
});
