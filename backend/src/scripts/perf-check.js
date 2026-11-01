/**
 * One-shot performance sanity check for the trips API.
 *
 *   node src/scripts/perf-check.js          (or: npm run perf:check)
 *
 * Prints:
 *   - which Atlas host/region you're connected to (compare against the VPS location)
 *   - the indexes actually built on the trips collection
 *   - published-trip count and average document size
 *   - timing + index usage for the query the category pages run
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trip from '../models/Trip.js';

dotenv.config();

const ms = (start) => `${(Number(process.hrtime.bigint() - start) / 1e6).toFixed(0)}ms`;

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set'); process.exit(1);
  }

  let t = process.hrtime.bigint();
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`\nconnected in ${ms(t)}  ->  host: ${mongoose.connection.host}`);
  console.log('  (if that host is far from your Contabo VPS region, every query pays that latency)\n');

  const coll = mongoose.connection.db.collection('trips');

  console.log('indexes on trips:');
  for (const ix of await coll.indexes()) {
    console.log(`  ${ix.name.padEnd(40)} ${JSON.stringify(ix.key)}`);
  }

  const stats = await mongoose.connection.db.command({ collStats: 'trips' }).catch(() => null);
  if (stats) {
    console.log(`\ndocuments: ${stats.count}   avgObjSize: ${(stats.avgObjSize / 1024).toFixed(1)} KB   storageSize: ${(stats.storageSize / 1024 / 1024).toFixed(1)} MB`);
  }

  const published = await Trip.countDocuments({ status: 'published' });
  console.log(`published trips: ${published}`);

  // The category-page query.
  const sampleCategory = await coll.findOne({ status: 'published', category: { $ne: null } }, { projection: { category: 1 } });
  if (sampleCategory?.category) {
    const q = { status: 'published', $and: [{ $or: [{ category: sampleCategory.category }] }] };

    t = process.hrtime.bigint();
    const rows = await Trip.find(q).select('-itinerary -faqs -beforeYouBook -accommodationAndMeals -comfortAddOns -tripNotes').limit(10).lean();
    console.log(`\ncategory query returned ${rows.length} rows in ${ms(t)}`);

    const plan = await coll.find(q).limit(10).explain('executionStats');
    const exec = plan.executionStats;
    console.log(`  totalDocsExamined: ${exec.totalDocsExamined}   totalKeysExamined: ${exec.totalKeysExamined}   executionTimeMillis: ${exec.executionTimeMillis}`);
    const stage = plan.queryPlanner.winningPlan?.inputStage?.stage || plan.queryPlanner.winningPlan?.stage;
    console.log(`  winning plan stage: ${stage}  ${stage === 'COLLSCAN' ? '  <-- NOT using an index!' : ''}`);
  }

  await mongoose.disconnect();
  console.log('\ndone.\n');
};

run().catch((err) => { console.error(err); process.exit(1); });
