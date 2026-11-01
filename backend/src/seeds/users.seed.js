import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('Seeding users...');

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trekkerssquad.example';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      console.log(`Admin user "${adminEmail}" already exists, skipping...`);
    } else {
      adminUser = new User({
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by pre-save hook
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });
      await adminUser.save();
      console.log(`✓ Created admin user: ${adminEmail}`);
    }

    // Create test user
    const testEmail = 'user@trekkerssquad.example';
    const testPassword = 'user123456';

    let testUser = await User.findOne({ email: testEmail });
    if (testUser) {
      console.log(`Test user "${testEmail}" already exists, skipping...`);
    } else {
      testUser = new User({
        email: testEmail,
        passwordHash: testPassword, // Will be hashed by pre-save hook
        name: 'Test User',
        role: 'user',
        isActive: true,
      });
      await testUser.save();
      console.log(`✓ Created test user: ${testEmail}`);
    }

    console.log('Users seeding completed!');
    console.log('\nDefault credentials:');
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`User: ${testEmail} / ${testPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

