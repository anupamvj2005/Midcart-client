const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');

dotenv.config();

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

// =====================
// 🔐 ENV SAFETY
// =====================
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'smartpharma-dev-jwt-change-in-production';
  console.warn('⚠️ JWT_SECRET not set — using default (change in production)');
}

// =====================
// 📁 STATIC FILES (uploads only)
// =====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// 🔐 SECURITY
// =====================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // allow frontend
  credentials: true
}));

// =====================
// 🚦 RATE LIMIT
// =====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, try again later.'
});
app.use('/api/', limiter);

// =====================
// 📊 MIDDLEWARE
// =====================
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================
// 🔗 API ROUTES
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/medicines', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

// =====================
// ✅ ROOT ROUTE (IMPORTANT FIX)
// =====================
app.get('/', (req, res) => {
  res.send('🚀 SmartPharma API is running successfully');
});

// =====================
// 🩺 HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// =====================
// ⏰ CRON JOB
// =====================
cron.schedule('0 8 * * *', checkExpiryAlerts);

// =====================
// ❌ ERROR HANDLER
// =====================
app.use(errorHandler);

// =====================
// 🚀 SERVER START
// =====================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 SmartPharma Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 CORS: ${process.env.CLIENT_URL || '*'}\n`);
    });

  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

start();