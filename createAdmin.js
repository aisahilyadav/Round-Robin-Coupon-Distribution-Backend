const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

async function updateAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await Admin.findOneAndUpdate(
      { username: 'admin' },
      { password: hashedPassword },
      { upsert: true, new: true }
    );
    
    console.log('Admin user updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
}

updateAdminUser();