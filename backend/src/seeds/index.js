import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

dotenv.config();

const seedAll = async () => {
  try {
    await connectDB();

    console.log('Starting database seeding...\n');

    // First seed users
    console.log('=== Seeding Users ===');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trekkerssquad.example';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        email: adminEmail,
        passwordHash: adminPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });
      await adminUser.save();
      console.log(`✓ Created admin user: ${adminEmail}`);
    } else {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
    }

    // Note: categories and trips run independently
    console.log('\n=== Seeding Categories, Regions & Trips ===');
    console.log('Run "npm run seed:categories" then "npm run seed:regions" then "npm run seed:countries" then "npm run seed:trips" to seed trip data');

    console.log('\n=== Seeding Complete ===');
    console.log('\nDefault credentials:');
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log('\nNext steps:');
    console.log('1. Run "npm run seed:categories" to seed categories');
    console.log('2. Run "npm run seed:regions" to seed regions');
    console.log('3. Run "npm run seed:countries" to seed countries');
    console.log('4. Run "npm run seed:trips" to seed trip data');
    console.log('3. Start the server with "npm start"');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedAll();
