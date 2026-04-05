const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { products } = require('./productSeedData');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});

    // Create admin
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@midcart.com',
      password: adminPassword,
      role: 'admin',
      phone: '9999999999',
    });
    await Cart.create({ user: admin._id, items: [] });

    // Create pharmacist
    const pharmPassword = await bcrypt.hash('Pharm@123', 12);
    const pharmacist = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'pharmacist@midcart.com',
      password: pharmPassword,
      role: 'pharmacist',
      phone: '9888888888',
    });
    await Cart.create({ user: pharmacist._id, items: [] });

    // Create test user
    const userPassword = await bcrypt.hash('User@123', 12);
    const user = await User.create({
      name: 'Rahul Patil',
      email: 'user@midcart.com',
      password: userPassword,
      role: 'user',
      phone: '9777777777',
    });
    await Cart.create({ user: user._id, items: [] });

    // Create products
    await Product.insertMany(products);

    console.log('\n✅ Database seeded successfully!');
    console.log('👤 Admin: admin@midcart.com / Admin@123');
    console.log('💊 Pharmacist: pharmacist@midcart.com / Pharm@123');
    console.log('🙍 User: user@midcart.com / User@123');
    console.log(`📦 Products: ${products.length} created (with product photos)`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
