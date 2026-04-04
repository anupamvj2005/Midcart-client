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
  console.warn('⚠️ JWT_SECRET not set — using default');
}

// =====================
// 📁 STATIC FILES
// =====================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// 🔐 SECURITY
// =====================
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.CLIENT_URL // your Vercel URL
  ],
  credentials: true
}));

// =====================
// 🚦 RATE LIMIT
// =====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api/', limiter);

// =====================
// 📊 MIDDLEWARE
// =====================
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
// ✅ ROOT ROUTE (FIXED)
// =====================
app.get('/', (req, res) => {
  res.status(200).json({
    message: "🚀 SmartPharma API is running",
    status: "OK"
  });
});

// =====================
// 🩺 HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});

// =====================
// ❌ 404 HANDLER (IMPORTANT)
// =====================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// =====================
// ❌ ERROR HANDLER
// =====================
app.use(errorHandler);

// =====================
// ⏰ CRON JOB
// =====================
cron.schedule('0 8 * * *', checkExpiryAlerts);

// =====================
// 🚀 SERVER START
// =====================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 ENV: ${process.env.NODE_ENV}`);
    });

  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

start();