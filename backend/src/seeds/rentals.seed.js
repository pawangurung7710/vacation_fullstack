import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import RentalCategory from '../models/RentalCategory.js';
import RentalProduct from '../models/RentalProduct.js';

dotenv.config();

const CATEGORY_SEEDS = [
  { label: 'Backpacks & Bags', slug: 'backpacks-bags', description: 'Daypacks and multi-day trekking packs.', order: 1 },
  { label: 'Camping & Shelter', slug: 'camping-shelter', description: 'Tents, sleeping bags, and camp comforts.', order: 2 },
  { label: 'Hiking Gear', slug: 'hiking-gear', description: 'Footwear and trail essentials.', order: 3 },
  { label: 'Bikes', slug: 'bikes', description: 'Mountain, road, and electric bikes.', order: 4 },
  { label: 'Water Sports', slug: 'water-sports', description: 'Kayaks and paddle gear.', order: 5 },
  { label: 'Photography', slug: 'photography', description: 'Cameras and photography kits.', order: 6 },
];

const PRODUCT_SEEDS = [
  {
    title: 'Trail Backpack 40L',
    categorySlug: 'backpacks-bags',
    shortDescription: 'A do-everything 40L pack for weekend treks.',
    description: 'Adjustable-fit 40L trail backpack with a rain cover, hip belt, and hydration sleeve — sized for 2-4 day treks.',
    images: ['https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 18,
    depositAmount: 30,
    quantityTotal: 8,
    minRentalDays: 1,
    specifications: [
      { label: 'Capacity', value: '40L' },
      { label: 'Weight', value: '1.4kg' },
      { label: 'Rain cover', value: 'Included' },
    ],
  },
  {
    title: 'Trekking Backpack 60L',
    categorySlug: 'backpacks-bags',
    shortDescription: 'Expedition-size pack for longer treks.',
    description: 'A 60L expedition backpack with a supportive internal frame, built for week-long treks with a full gear load.',
    images: ['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 20,
    depositAmount: 35,
    quantityTotal: 6,
    minRentalDays: 1,
    specifications: [
      { label: 'Capacity', value: '60L' },
      { label: 'Frame', value: 'Internal, adjustable' },
    ],
  },
  {
    title: 'Daypack 20L',
    categorySlug: 'backpacks-bags',
    shortDescription: 'Lightweight pack for day hikes.',
    description: 'A compact 20L daypack with a padded back panel — ideal for single-day hikes and city sightseeing.',
    images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 10,
    depositAmount: 15,
    quantityTotal: 10,
    minRentalDays: 1,
    specifications: [{ label: 'Capacity', value: '20L' }],
  },
  {
    title: '2-Person Tent',
    categorySlug: 'camping-shelter',
    shortDescription: 'Lightweight tent for two.',
    description: 'A freestanding 2-person tent, quick to pitch and weatherproof — great for lunch breaks or overnight camps.',
    images: ['https://images.unsplash.com/photo-1445307806294-bff7f67ff225?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 22,
    depositAmount: 50,
    quantityTotal: 6,
    minRentalDays: 1,
    specifications: [
      { label: 'Capacity', value: '2 people' },
      { label: 'Season rating', value: '3-season' },
    ],
  },
  {
    title: '4-Person Family Tent',
    categorySlug: 'camping-shelter',
    shortDescription: 'Roomy tent for family camping.',
    description: 'A spacious 4-person family tent with a vestibule for gear storage — comfortable for group basecamps.',
    images: ['https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 30,
    depositAmount: 60,
    quantityTotal: 4,
    minRentalDays: 1,
    specifications: [{ label: 'Capacity', value: '4 people' }],
  },
  {
    title: 'Camping Hammock',
    categorySlug: 'camping-shelter',
    shortDescription: 'Packable hammock for camp downtime.',
    description: 'A lightweight, packable camping hammock with tree straps included — sets up between two trees in minutes.',
    images: ['https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 11,
    depositAmount: 15,
    quantityTotal: 8,
    minRentalDays: 1,
    specifications: [{ label: 'Max load', value: '150kg' }],
  },
  {
    title: 'Sleeping Bag',
    categorySlug: 'camping-shelter',
    shortDescription: 'Warm 3-season sleeping bag.',
    description: 'A 3-season mummy sleeping bag rated to -5°C, compresses down small for packing.',
    images: ['https://images.unsplash.com/photo-1508138221679-760a23a2285b?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 14,
    depositAmount: 20,
    quantityTotal: 10,
    minRentalDays: 1,
    specifications: [{ label: 'Temp rating', value: '-5°C' }],
  },
  {
    title: 'Camping Stove',
    categorySlug: 'camping-shelter',
    shortDescription: 'Compact stove for camp cooking.',
    description: 'A compact single-burner camping stove — boils a liter of water in about 3 minutes.',
    images: ['https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 10,
    depositAmount: 15,
    quantityTotal: 8,
    minRentalDays: 1,
    specifications: [{ label: 'Fuel type', value: 'Butane canister' }],
  },
  {
    title: 'Portable Camping Chair',
    categorySlug: 'camping-shelter',
    shortDescription: 'Folding chair for camp comfort.',
    description: 'A lightweight folding camp chair that packs into its own carry bag.',
    images: ['https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 7,
    depositAmount: 10,
    quantityTotal: 12,
    minRentalDays: 1,
    specifications: [{ label: 'Max load', value: '120kg' }],
  },
  {
    title: 'LED Headlamp',
    categorySlug: 'camping-shelter',
    shortDescription: 'Bright, lightweight headlamp.',
    description: 'A rechargeable LED headlamp with adjustable brightness — essential for early starts and camp evenings.',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 6,
    depositAmount: 10,
    quantityTotal: 15,
    minRentalDays: 1,
    specifications: [{ label: 'Battery', value: 'USB rechargeable' }],
  },
  {
    title: 'Hiking Boots',
    categorySlug: 'hiking-gear',
    shortDescription: 'Waterproof boots for the trail.',
    description: 'Waterproof, ankle-support hiking boots — broken in and ready for rocky, uneven terrain.',
    images: ['https://images.unsplash.com/photo-1487730116645-74489c95b41b?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 12,
    depositAmount: 20,
    quantityTotal: 10,
    minRentalDays: 1,
    specifications: [{ label: 'Waterproofing', value: 'Yes' }],
  },
  {
    title: 'Trekking Poles (Pair)',
    categorySlug: 'hiking-gear',
    shortDescription: 'Adjustable poles for stability.',
    description: 'A pair of adjustable, collapsible trekking poles with shock absorption for descents.',
    images: ['https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 8,
    depositAmount: 10,
    quantityTotal: 12,
    minRentalDays: 1,
    specifications: [{ label: 'Material', value: 'Aluminum' }],
  },
  {
    title: 'Trekking Poles Set (Carbon)',
    categorySlug: 'hiking-gear',
    shortDescription: 'Lightweight carbon trekking poles.',
    description: 'Ultralight carbon-fiber trekking poles for trekkers who want to shave off pack weight.',
    images: ['https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 9,
    depositAmount: 15,
    quantityTotal: 8,
    minRentalDays: 1,
    specifications: [{ label: 'Material', value: 'Carbon fiber' }],
  },
  {
    title: 'Polarized Sunglasses',
    categorySlug: 'hiking-gear',
    shortDescription: 'UV-protective trail sunglasses.',
    description: 'Polarized, UV-protective sunglasses for high-altitude glare and snow.',
    images: ['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 9,
    depositAmount: 10,
    quantityTotal: 10,
    minRentalDays: 1,
    specifications: [{ label: 'UV protection', value: 'UV400' }],
  },
  {
    title: 'Insulated Water Bottle',
    categorySlug: 'hiking-gear',
    shortDescription: 'Keeps drinks hot or cold all day.',
    description: 'A double-walled insulated water bottle that keeps drinks cold for 24 hours or hot for 12.',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 5,
    depositAmount: 5,
    quantityTotal: 15,
    minRentalDays: 1,
    specifications: [{ label: 'Capacity', value: '1L' }],
  },
  {
    title: 'Mountain Bike',
    categorySlug: 'bikes',
    shortDescription: 'Full-suspension bike for trails.',
    description: 'A full-suspension mountain bike, tuned for singletrack and mixed-terrain rides.',
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 25,
    depositAmount: 60,
    quantityTotal: 6,
    minRentalDays: 1,
    specifications: [{ label: 'Suspension', value: 'Full' }],
  },
  {
    title: 'Road Bike',
    categorySlug: 'bikes',
    shortDescription: 'Lightweight bike for paved rides.',
    description: 'A lightweight road bike with drop bars, built for long-distance paved rides.',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 20,
    depositAmount: 50,
    quantityTotal: 5,
    minRentalDays: 1,
    specifications: [{ label: 'Frame', value: 'Aluminum' }],
  },
  {
    title: 'Electric Bike',
    categorySlug: 'bikes',
    shortDescription: 'Pedal-assist bike for effortless miles.',
    description: 'A pedal-assist electric bike with a 60km range — flattens hills and extends your range.',
    images: ['https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 40,
    depositAmount: 100,
    quantityTotal: 4,
    minRentalDays: 1,
    specifications: [{ label: 'Battery range', value: '~60km' }],
  },
  {
    title: 'Single Kayak',
    categorySlug: 'water-sports',
    shortDescription: 'Stable kayak for calm water.',
    description: 'A stable, single-seat touring kayak with a paddle and life jacket included.',
    images: ['https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 28,
    depositAmount: 60,
    quantityTotal: 5,
    minRentalDays: 1,
    specifications: [
      { label: 'Seats', value: '1' },
      { label: 'Includes', value: 'Paddle & life jacket' },
    ],
  },
  {
    title: 'Mirrorless Camera Kit',
    categorySlug: 'photography',
    shortDescription: 'Full kit for trip photography.',
    description: 'A mirrorless camera kit with a versatile zoom lens, spare battery, and memory card — ready to shoot out of the box.',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=70'],
    pricePerDay: 35,
    depositAmount: 150,
    quantityTotal: 3,
    minRentalDays: 1,
    specifications: [
      { label: 'Lens', value: '24-70mm zoom' },
      { label: 'Includes', value: 'Spare battery, SD card' },
    ],
  },
];

const seedRentals = async () => {
  try {
    await connectDB();

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@trekkerssquad.example';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
      adminUser = await User.create({
        email: adminEmail,
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });
      console.log(`✓ Created admin user: ${adminEmail}`);
    }

    console.log('\n=== Seeding Rental Categories ===');
    const categoryMap = {};
    for (const category of CATEGORY_SEEDS) {
      let doc = await RentalCategory.findOne({ slug: category.slug });
      if (!doc) {
        doc = await RentalCategory.create({ ...category, isActive: true });
        console.log(`✓ Created category: ${category.label}`);
      } else {
        console.log(`• Category already exists: ${category.label}`);
      }
      categoryMap[category.slug] = doc._id;
    }

    console.log('\n=== Seeding Rental Products ===');
    for (const product of PRODUCT_SEEDS) {
      const existing = await RentalProduct.findOne({ title: product.title });
      if (existing) {
        console.log(`• Product already exists: ${product.title}`);
        continue;
      }

      const { categorySlug, ...rest } = product;
      await RentalProduct.create({
        ...rest,
        category: categoryMap[categorySlug],
        status: 'published',
        createdBy: adminUser._id,
      });
      console.log(`✓ Created product: ${product.title}`);
    }

    console.log('\n=== Rentals Seeding Complete ===');
    console.log(`${CATEGORY_SEEDS.length} categories, ${PRODUCT_SEEDS.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rentals:', error);
    process.exit(1);
  }
};

seedRentals();
