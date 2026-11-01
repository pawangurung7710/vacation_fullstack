import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import ImpactMetric from '../models/ImpactMetric.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedImpact = async () => {
  try {
    await connectDB();

    console.log('Seeding impact metrics...');

    // Read impact data from JSON
    const impactDataPath = join(__dirname, '../data/impact.json');
    const impactData = JSON.parse(readFileSync(impactDataPath, 'utf-8'));

    // Map category from JSON to model enum
    const categoryMap = {
      environment: 'environmental',
      social: 'social',
      economic: 'economic',
      cultural: 'cultural',
    };

    for (const metricData of impactData) {
      // Check if impact metric already exists
      const existingMetric = await ImpactMetric.findOne({ title: metricData.title });
      if (existingMetric) {
        console.log(`Impact metric "${metricData.title}" already exists, skipping...`);
        continue;
      }

      const impactMetric = new ImpactMetric({
        title: metricData.title,
        value: metricData.value,
        description: metricData.description,
        category: categoryMap[metricData.category] || metricData.category,
        icon: metricData.icon,
        order: metricData.order || 0,
        isActive: true,
      });

      await impactMetric.save();
      console.log(`✓ Seeded impact metric: ${metricData.title}`);
    }

    console.log('Impact metrics seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding impact metrics:', error);
    process.exit(1);
  }
};

seedImpact();

