const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard summary
// @route   GET /api/analytics/summary
// @access  Admin
const getDashboardSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalOrders, monthOrders, lastMonthOrders,
    totalRevenue, monthRevenue,
    totalUsers, newUsersThisMonth,
    totalProducts, lowStockCount, nearExpiryCount
  ] = await Promise.all([
    Order.countDocuments({ status: { $ne: 'cancelled' } }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }, status: { $ne: 'cancelled' } }),

    Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),

    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),

    Product.countDocuments({ isActive: true }),
    Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] }
    }),
    Product.countDocuments({
      isActive: true,
      expiryDate: {
        $lte: new Date(+now + 30 * 24 * 60 * 60 * 1000),
        $gte: now
      }
    }),
  ]);

  res.json({
    success: true,
    summary: {
      orders: {
        total: totalOrders,
        thisMonth: monthOrders,
        lastMonth: lastMonthOrders,
        growth: lastMonthOrders > 0
          ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
          : 100,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0,
      },
      users: { total: totalUsers, newThisMonth: newUsersThisMonth },
      inventory: { total: totalProducts, lowStock: lowStockCount, nearExpiry: nearExpiryCount },
    },
  });
});

// @desc    Get revenue chart data (last 7 days / 30 days)
// @route   GET /api/analytics/revenue
// @access  Admin
const getRevenueChart = asyncHandler(async (req, res) => {
  const { period = '7' } = req.query;
  const days = parseInt(period);
  const startDate = new Date(+new Date() - days * 24 * 60 * 60 * 1000);

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled', 'returned'] },
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data });
});

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Admin
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort('-salesCount')
    .limit(10)
    .select('name salesCount price category images');

  res.json({ success: true, products });
});

// @desc    Get category-wise sales
// @route   GET /api/analytics/categories
// @access  Admin
const getCategoryStats = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { status: { $nin: ['cancelled', 'returned'] } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.category',
        totalSales: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  res.json({ success: true, data });
});

module.exports = { getDashboardSummary, getRevenueChart, getTopProducts, getCategoryStats };
