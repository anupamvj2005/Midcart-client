const mongoose = require("mongoose");
const dotenv = require("dotenv");
const medicines = require("./data/medicines");
const Product = require("./models/Product");

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany();
    await Product.insertMany(medicines);
    console.log("✅ Medicines Seeded");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
