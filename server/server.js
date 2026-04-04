const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const path = require('path');


if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'smartpharma-dev-jwt-change-in-production';
  console.warn('⚠️  JWT_SECRET not set — using a development default. Set JWT_SECRET in backend/.env for production.');
}

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { checkExpiryAlerts } = require('./utils/cronJobs');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mlRoutes = require('./routes/mlRoutes');

const app = express();

// Local prescription/product uploads (when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging & Parsing
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/medicines', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cron Jobs
// Run expiry check every day at 8 AM
cron.schedule('0 8 * * *', checkExpiryAlerts);

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    console.error('   Fix MONGO_URI in backend/.env (include /smartpharma or your DB name).' +
      ' For Atlas: Network Access must allow your IP.');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`\n🚀 SmartPharma Backend running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
  });
};

start();
