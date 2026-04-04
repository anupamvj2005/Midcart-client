/**
 * Updates product images only (by product name). Does not delete users or carts.
 * Run: npm run seed:images
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('../models/Product');
const { products } = require('./productSeedData');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Patching images…');

  let updated = 0;
  for (const p of products) {
    const r = await Product.updateOne({ name: p.name }, { $set: { images: p.images } });
    if (r.matchedCount === 0) {
      console.log(`  (skip) No product named: ${p.name}`);
    } else {
      updated += r.modifiedCount;
      console.log(`  ✓ ${p.name}`);
    }
  }

  console.log(`\nDone. Matched products; ${updated} documents modified.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
