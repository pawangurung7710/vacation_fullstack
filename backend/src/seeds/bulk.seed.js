/**
 * Large-scale demo data: category tree, countries, regions, thousands of trips,
 * guides, testimonials and blog posts.
 *
 *   npm run seed:bulk                 # default sizes
 *   BULK_TRIPS=5000 npm run seed:bulk # more trips
 *
 * Safe to re-run: existing categories, countries, regions and trip slugs are skipped.
 * Output is deterministic (seeded random), so every run produces the same catalogue.
 */
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Country from '../models/Country.js';
import Region from '../models/Region.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Guide from '../models/Guide.js';
import Testimonial from '../models/Testimonial.js';
import BlogPost from '../models/BlogPost.js';
import { generateSlug } from '../utils/slugify.js';
import {
  CATEGORIES,
  GEOGRAPHY,
  DIFFICULTY_PRICE,
  TRIP_TAGS,
  SEASONS,
  HIGHLIGHT_TEMPLATES,
  INCLUSIONS,
  EXCLUSIONS,
  DAY_TITLES,
  DAY_DESCRIPTIONS,
  BLOG_CATEGORIES,
  BLOG_TITLES,
  BLOG_PARAGRAPHS,
  REVIEW_SNIPPETS,
  FIRST_NAMES,
  LAST_NAMES,
  HOME_CITIES,
} from '../data/catalog.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const readJson = (file) => JSON.parse(readFileSync(join(__dirname, '../data', file), 'utf-8'));
const IMAGE_POOLS = readJson('imagePools.json');
const PORTRAITS = readJson('portraitIds.json');

const TRIP_COUNT = Number(process.env.BULK_TRIPS || process.argv[2] || 2400);
const TESTIMONIAL_COUNT = Number(process.env.BULK_TESTIMONIALS || 900);
const BLOG_COUNT = Number(process.env.BULK_BLOG || 180);
const GUIDE_COUNT = 36;

// --- deterministic random -------------------------------------------------
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = mulberry32(20260101);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p) => rand() < p;
const sample = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  return out;
};
const fill = (text, vars) => text.replace(/\{(\w)\}/g, (_, k) => vars[k] ?? '');

const imageUrl = (id, width = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
const poolImage = (themes) => {
  const theme = pick(themes.filter((t) => IMAGE_POOLS[t]?.length) || ['mountain']);
  return pick(IMAGE_POOLS[theme] || IMAGE_POOLS.mountain);
};

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();

// --- taxonomy / geography -------------------------------------------------
const seedTaxonomy = async () => {
  const subDocs = {};
  let order = 1;
  for (const cat of CATEGORIES) {
    const top = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: { label: cat.label, tagline: cat.tagline, level: 0, parent: null, order: order++, isActive: true },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    let subOrder = 1;
    for (const sub of cat.subs) {
      const doc = await Category.findOneAndUpdate(
        { slug: sub.slug },
        {
          $set: {
            label: sub.label,
            tagline: sub.tagline,
            parent: top._id,
            level: 1,
            order: subOrder++,
            isActive: true,
            heroImage: imageUrl(poolImage(sub.img), 2000),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      subDocs[sub.slug] = { doc, sub, top };
    }
  }
  return subDocs;
};

const seedGeography = async () => {
  const countries = {};
  const regions = {};
  for (const [name, geo] of Object.entries(GEOGRAPHY)) {
    const country = await Country.findOneAndUpdate({ name }, { $setOnInsert: { name, isActive: true } }, { upsert: true, new: true });
    countries[name] = { doc: country, ...geo, regionDocs: [] };
    for (const regionName of geo.regions) {
      const region = await Region.findOneAndUpdate(
        { name: regionName },
        { $setOnInsert: { name: regionName, isActive: true } },
        { upsert: true, new: true }
      );
      regions[regionName] = region;
      countries[name].regionDocs.push({ name: regionName, doc: region });
    }
  }
  return { countries, regions };
};

// --- guides ---------------------------------------------------------------
const seedGuides = async () => {
  const existing = await Guide.countDocuments();
  if (existing >= GUIDE_COUNT) return Guide.find().limit(GUIDE_COUNT);
  const roles = ['Lead Mountain Guide', 'Trail Guide', 'Wildlife Guide', 'Cultural Guide', 'Climbing Instructor', 'Ski Guide', 'Cycling Guide', 'Expedition Doctor'];
  const quotes = [
    'The best views are earned slowly.',
    'Every group teaches me something new.',
    'Safety first, then summit.',
    'I never get tired of the first light on a ridge.',
    'Good snacks fix almost everything.',
    'Leave every place a little better than you found it.',
  ];
  const docs = [];
  for (let i = 0; i < GUIDE_COUNT; i++) {
    docs.push({
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      role: pick(roles),
      experience: `${int(4, 22)} years guiding`,
      languages: sample(['English', 'Spanish', 'French', 'German', 'Hindi', 'Nepali', 'Japanese', 'Italian'], int(2, 3)).join(', '),
      imageUrl: `https://images.unsplash.com/photo-${PORTRAITS[i % PORTRAITS.length]}?auto=format&fit=crop&w=600&h=750&q=80`,
      quote: pick(quotes),
      order: i + 1,
      isActive: true,
    });
  }
  return Guide.insertMany(docs);
};

// --- trips ----------------------------------------------------------------
const difficultyFor = (subSlug) => {
  const hard = ['mountaineering', 'peak-climbing', 'ice-climbing', 'heli-skiing', 'polar-voyages'];
  const easy = ['day-hikes', 'e-bike-tours', 'heritage-walks', 'food-wine', 'village-homestays', 'yoga-retreats', 'wellness-escapes', 'digital-detox', 'northern-lights', 'wildlife-safari'];
  const r = rand();
  if (hard.includes(subSlug)) return r < 0.1 ? 'moderate' : r < 0.6 ? 'challenging' : 'expert';
  if (easy.includes(subSlug)) return r < 0.6 ? 'easy' : r < 0.95 ? 'moderate' : 'challenging';
  return r < 0.2 ? 'easy' : r < 0.6 ? 'moderate' : r < 0.9 ? 'challenging' : 'expert';
};

const buildDepartures = (days, basePrice, maxGroup) => {
  const count = int(3, 7);
  const departures = [];
  let cursor = NOW + int(5, 25) * DAY_MS;
  for (let i = 0; i < count; i++) {
    const start = new Date(cursor);
    const total = maxGroup;
    const seats = chance(0.08) ? 0 : int(1, total);
    departures.push({
      startDate: start,
      endDate: new Date(cursor + Math.max(days - 1, 0) * DAY_MS),
      pricePerPerson: Math.round((basePrice * (0.95 + rand() * 0.2)) / 5) * 5,
      totalSeats: total,
      seatsAvailable: seats,
      status: seats === 0 ? 'sold_out' : 'scheduled',
      badges: chance(0.15) ? [pick(['Best seller', 'Early bird', 'Last spots'])] : [],
    });
    cursor += int(18, 55) * DAY_MS;
  }
  return departures;
};

const buildItinerary = (days, region, sub) => {
  const shown = Math.min(days, 8);
  return Array.from({ length: shown }, (_, i) => ({
    day: i + 1 === shown && days > shown ? `Day ${i + 1}–${days}` : `Day ${i + 1}`,
    title: i === 0 ? DAY_TITLES[0] : i === shown - 1 && days > 1 ? 'Final day and farewell' : fill(DAY_TITLES[1 + (i % (DAY_TITLES.length - 1))], { R: region }),
    description: DAY_DESCRIPTIONS[i % DAY_DESCRIPTIONS.length],
    location: region,
    meals: i === 0 ? 'Dinner' : 'Breakfast, lunch, dinner',
    accommodation: sub.slug.includes('camp') || sub.slug.includes('trek') ? 'Camp or mountain lodge' : 'Boutique guesthouse',
  }));
};

const buildTrips = (subDocs, countries, adminId, guides, existingSlugs) => {
  const subs = Object.values(subDocs);
  const countryList = Object.entries(countries);
  const usedTitles = new Set();
  const trips = [];
  const prefixes = ['Classic', 'Essential', 'Signature', 'Explorer', 'Highlights of', 'Extended', 'Express', 'Wild'];

  for (let i = 0; i < TRIP_COUNT; i++) {
    const { doc: subDoc, sub, top } = subs[i % subs.length];
    const eligible = countryList.filter(([, c]) => c.tags.some((t) => sub.tags.includes(t)));
    const [countryName, country] = pick(eligible.length ? eligible : countryList);
    const regionEntry = pick(country.regionDocs);
    const region = regionEntry.name;

    let title = fill(pick(sub.patterns), { R: region });
    let slug = generateSlug(title);
    let attempt = 0;
    while ((usedTitles.has(slug) || existingSlugs.has(slug)) && attempt < 12) {
      const variant = attempt < 8 ? `${pick(prefixes)} ${fill(pick(sub.patterns), { R: region })}` : `${fill(pick(sub.patterns), { R: region })} ${int(2, 9)}`;
      title = variant.replace(/^Highlights of (.*)$/i, 'Highlights of $1');
      slug = generateSlug(title);
      attempt++;
    }
    if (usedTitles.has(slug) || existingSlugs.has(slug)) continue;
    usedTitles.add(slug);

    const days = pick(sub.days);
    const difficulty = difficultyFor(sub.slug);
    const maxGroup = pick([6, 8, 10, 12, 12, 14, 16]);
    const price = Math.max(
      60,
      Math.round((sub.perDay * days * DIFFICULTY_PRICE[difficulty] * (0.85 + rand() * 0.45)) / 5) * 5
    );
    const heroId = poolImage(sub.img);
    const galleryIds = [heroId, ...sample(IMAGE_POOLS[pick(sub.img)] || IMAGE_POOLS.mountain, 4)];
    const createdAt = new Date(NOW - int(1, 420) * DAY_MS);
    const vars = { R: region, C: countryName, N: maxGroup };

    trips.push({
      title,
      slug,
      category: top._id,
      subcategory: subDoc._id,
      regionRef: regionEntry.doc._id,
      countryRef: country.doc._id,
      region,
      country: countryName,
      duration: String(days),
      difficulty,
      price,
      image: imageUrl(heroId, 1600),
      heroSubtitle: sub.tagline,
      description: `${sub.tagline} in ${region}, ${countryName}. Join a small group of up to ${maxGroup} for ${days} ${days === 1 ? 'day' : 'days'} led by a local expert, with stays, meals and transport planned for you. ${pick(['Expect long views and good company.', 'The route balances effort with plenty of time to look around.', 'We keep the pace friendly and the logistics invisible.', 'Perfect if you want the adventure without the planning.'])}`,
      highlights: sample(HIGHLIGHT_TEMPLATES, 4).map((h) => fill(h, vars)),
      // Kept as the field name the front-end already reads; values are simple trip tags.
      sustainabilityBadges: sample(TRIP_TAGS, int(1, 3)),
      maxGroupSize: maxGroup,
      season: pick(SEASONS),
      departures: buildDepartures(days, price, maxGroup),
      inclusions: sample(INCLUSIONS, 5),
      exclusions: sample(EXCLUSIONS, 4),
      itinerary: buildItinerary(days, region, sub),
      highlightGallery: galleryIds.map((id, idx) => ({ image: imageUrl(id, 1400), caption: idx === 0 ? title : `${region} moments` })),
      guides: sample(guides, 2).map((g) => g._id),
      featured: chance(0.07),
      views: int(0, 6000),
      status: 'published',
      createdBy: adminId,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return trips;
};

const insertBatches = async (Model, docs, label, size = 400) => {
  let done = 0;
  for (let i = 0; i < docs.length; i += size) {
    const chunk = docs.slice(i, i + size);
    await Model.insertMany(chunk, { ordered: false, timestamps: false });
    done += chunk.length;
    process.stdout.write(`\r  ${label}: ${done}/${docs.length}`);
  }
  process.stdout.write('\n');
};

// --- testimonials & blog --------------------------------------------------
const seedTestimonials = async (adminId) => {
  const trips = await Trip.find({ status: 'published' }).select('_id').limit(2500).lean();
  if (!trips.length) return;
  const docs = [];
  for (let i = 0; i < TESTIMONIAL_COUNT; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const approvedAt = new Date(NOW - int(1, 400) * DAY_MS);
    docs.push({
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      trip: pick(trips)._id,
      rating: chance(0.7) ? 5 : chance(0.8) ? 4 : 3,
      testimonial: `${pick(REVIEW_SNIPPETS)} ${chance(0.4) ? pick(REVIEW_SNIPPETS) : ''}`.trim(),
      location: pick(HOME_CITIES),
      status: 'approved',
      featured: i < 24,
      approvedBy: adminId,
      approvedAt,
      createdAt: approvedAt,
      updatedAt: approvedAt,
    });
  }
  await insertBatches(Testimonial, docs, 'testimonials');
};

const seedBlog = async (adminId, guides) => {
  const regionNames = Object.values(GEOGRAPHY).flatMap((g) => g.regions);
  const countryNames = Object.keys(GEOGRAPHY);
  const used = new Set((await BlogPost.find().select('slug').lean()).map((p) => p.slug));
  const docs = [];
  for (let i = 0; i < BLOG_COUNT; i++) {
    const cat = BLOG_CATEGORIES[i % BLOG_CATEGORIES.length];
    const vars = { R: pick(regionNames), C: pick(countryNames) };
    let title = fill(pick(BLOG_TITLES[cat.key]), vars);
    let slug = generateSlug(title);
    if (used.has(slug)) {
      title = `${title}: notes from ${int(2019, 2026)}`;
      slug = generateSlug(title);
    }
    if (used.has(slug)) continue;
    used.add(slug);
    const paragraphs = sample(BLOG_PARAGRAPHS, 4);
    const published = new Date(NOW - int(1, 540) * DAY_MS);
    const themeForCat = { destinations: ['mountain', 'coast', 'culture'], gear: ['camping', 'mountain'], training: ['cycling', 'mountain', 'yoga'], stories: ['mountain', 'forest', 'snow'], safety: ['snow', 'mountain'], guides: ['mountain', 'culture'] }[cat.key];
    docs.push({
      title,
      slug,
      excerpt: paragraphs[0].slice(0, 150).trim() + '…',
      content: paragraphs.map((p) => `<p>${p}</p>`).join(''),
      featuredImage: imageUrl(poolImage(themeForCat), 1200),
      author: adminId,
      authorName: pick(guides).name,
      tags: [cat.label],
      category: cat.key,
      readTime: `${int(3, 11)} min read`,
      status: 'published',
      publishedAt: published,
      featured: i < 8,
      views: int(10, 9000),
      createdAt: published,
      updatedAt: published,
    });
  }
  await insertBatches(BlogPost, docs, 'blog posts', 200);
};

// --- main -----------------------------------------------------------------
const run = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Run "npm run seed:users" first.');
      process.exit(1);
    }

    console.log('Seeding categories and sub-categories...');
    const subDocs = await seedTaxonomy();
    console.log(`  ${CATEGORIES.length} categories, ${Object.keys(subDocs).length} sub-categories`);

    console.log('Seeding countries and regions...');
    const { countries, regions } = await seedGeography();
    console.log(`  ${Object.keys(countries).length} countries, ${Object.keys(regions).length} regions`);

    console.log('Seeding guides...');
    const guides = await seedGuides();
    console.log(`  ${guides.length} guides`);

    console.log(`Generating ${TRIP_COUNT} trips...`);
    const existingSlugs = new Set((await Trip.find().select('slug').lean()).map((t) => t.slug));
    const trips = buildTrips(subDocs, countries, admin._id, guides, existingSlugs);
    await insertBatches(Trip, trips, 'trips');

    console.log('Seeding testimonials...');
    await seedTestimonials(admin._id);

    console.log('Seeding blog posts...');
    await seedBlog(admin._id, guides);

    const total = await Trip.countDocuments();
    console.log(`\nBulk seeding complete. ${total} trips in the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during bulk seeding:', error);
    process.exit(1);
  }
};

run();
