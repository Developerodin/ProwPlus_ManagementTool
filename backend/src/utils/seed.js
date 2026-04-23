require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const email = (process.env.ADMIN_EMAIL || 'admin@prowplus.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] admin already exists: ${email}`);
    process.exit(0);
  }
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
    isActive: true,
  });
  console.log(`[seed] created admin: ${admin.email}  (change password after first login)`);
  process.exit(0);
})();
