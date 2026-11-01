import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import TeamMember from '../models/TeamMember.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedTeam = async () => {
  try {
    await connectDB();

    console.log('Seeding team members...');

    // Read team data from JSON
    const teamDataPath = join(__dirname, '../data/team.json');
    const teamData = JSON.parse(readFileSync(teamDataPath, 'utf-8'));

    for (const memberData of teamData) {
      // Check if team member already exists
      const existingMember = await TeamMember.findOne({ email: memberData.email });
      if (existingMember) {
        console.log(`Team member "${memberData.name}" already exists, skipping...`);
        continue;
      }

      const teamMember = new TeamMember({
        ...memberData,
      });

      await teamMember.save();
      console.log(`✓ Seeded team member: ${memberData.name}`);
    }

    console.log('Team members seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding team members:', error);
    process.exit(1);
  }
};

seedTeam();

