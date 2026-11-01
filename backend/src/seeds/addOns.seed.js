import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import AddOn from '../models/AddOn.js';
import { generateSlug } from '../utils/slugify.js';

dotenv.config();

/**
 * Default global add-ons: the 3 comfort upgrades that used to be baked into the
 * Trip schema default, plus the 2 seed "short activities" as bookable activities.
 */
const ADD_ON_SEEDS = [
  {
    title: 'Extra night before or after the trip',
    kind: 'comfort',
    description: 'Upgrade your stay before or after the trek.',
    pricingType: 'choice',
    options: [
      { label: 'I will book my own accommodation', price: 0, priceUnit: 'No upgrade' },
      { label: '3-star hotel', price: 85, priceUnit: '/pp' },
      { label: '5-star hotel', price: 195, priceUnit: '/pp' },
    ],
    discountEligible: true,
    scope: 'global',
    status: 'active',
    order: 1,
  },
  {
    title: 'Additional porterage allowance',
    kind: 'comfort',
    description: 'Extra porter for an additional 5 kg of luggage.',
    pricingType: 'flat',
    price: 45,
    priceUnit: 'per person',
    discountEligible: true,
    scope: 'global',
    status: 'active',
    order: 2,
  },
  {
    title: 'Half-day local highlights tour',
    kind: 'comfort',
    description: 'Guided visit to the best-known sights and a local lunch.',
    pricingType: 'flat',
    price: 65,
    priceUnit: 'per person',
    discountEligible: true,
    scope: 'global',
    status: 'active',
    order: 3,
  },
  {
    title: 'Sunrise Ridge Walk',
    kind: 'activity',
    description:
      'An early-morning ridge walk to catch first light over the surrounding peaks.',
    pricingType: 'flat',
    price: 85,
    priceUnit: 'per person',
    duration: '1 day',
    activityType: 'Activity',
    location: 'Base town',
    discountEligible: true,
    scope: 'global',
    status: 'active',
    order: 10,
  },
  {
    title: "Local Makers Workshop",
    kind: 'activity',
    description:
      'Spend a half day with the women artisans of Syabrubesi learning traditional backstrap weaving.',
    pricingType: 'flat',
    price: 65,
    priceUnit: 'per person',
    duration: 'Half day',
    activityType: 'Workshop',
    location: 'Syabrubesi',
    discountEligible: true,
    scope: 'global',
    status: 'active',
    order: 11,
  },
];

const seedAddOns = async () => {
  try {
    await connectDB();
    console.log('Seeding add-ons...');

    for (const seed of ADD_ON_SEEDS) {
      const slug = generateSlug(seed.title);
      const existing = await AddOn.findOne({ slug });
      if (existing) {
        console.log(`Add-on "${seed.title}" already exists, skipping...`);
        continue;
      }
      await AddOn.create({ ...seed, slug });
      console.log(`✓ Seeded add-on: ${seed.title}`);
    }

    console.log('Add-ons seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding add-ons:', error);
    process.exit(1);
  }
};

seedAddOns();
