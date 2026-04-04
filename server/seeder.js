const mongoose = require("mongoose");
const dotenv = require("dotenv");
const medicines = require("./data/medicines");
const Product = require("./models/Product");

dotenv.config();

// =======================
// 🔌 CONNECT DB
// =======================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

// =======================
// 🌱 IMPORT DATA
// =======================
const importData = async () => {
  try {
    await connectDB();

    console.log("🧹 Deleting old data...");
    await Product.deleteMany();

    console.log("📦 Inserting new medicines...");
    await Product.insertMany(medicines);

    console.log("✅ Medicines Seeded Successfully 🚀");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

// =======================
// 🧹 OPTIONAL DELETE MODE
// =======================
const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log("🗑️ Data Destroyed");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// =======================
// ⚙️ RUN MODE
// =======================
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}