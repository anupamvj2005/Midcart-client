const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Product = require('../models/Product');
const Order = require('../models/Order');

const ML_URL = process.env.ML_API_URL || 'http://localhost:8000';

// @desc    Get demand forecast for a product
// @route   GET /api/ml/forecast/:productId
// @access  Admin
const getDemandForecast = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get historical sales data
  const salesData = await Order.aggregate([
    { $match: { status: { $nin: ['cancelled', 'returned'] } } },
    { $unwind: '$items' },
    { $match: { 'items.product': product._id } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        quantity: { $sum: '$items.quantity' },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  try {
    const mlRes = await axios.post(`${ML_URL}/demand-forecast`, {
      product_id: product._id,
      product_name: product.name,
      category: product.category,
      sales_history: salesData,
    }, { timeout: 15000 });

    res.json({ success: true, forecast: mlRes.data });
  } catch (err) {
    res.status(503);
    throw new Error(
      `ML service unreachable (${ML_URL}). Start the ml-api (python app.py) or check ML_API_URL in .env.`
    );
  }
});

// @desc    Get recommendations for a product
// @route   GET /api/ml/recommendations/:productId
// @access  Public
const getRecommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get co-purchased products
  const coPurchased = await Order.aggregate([
    { $match: { status: { $nin: ['cancelled', 'returned'] } } },
    { $match: { 'items.product': product._id } },
    { $unwind: '$items' },
    { $match: { 'items.product': { $ne: product._id } } },
    { $group: { _id: '$items.product', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const productIds = coPurchased.map(p => p._id);

  let recommendations = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).select('name price images category ratings');

  // If not enough co-purchased, fill with same category
  if (recommendations.length < 4) {
    const extra = await Product.find({
      category: product.category,
      _id: { $ne: product._id, $nin: productIds },
      isActive: true,
    })
      .sort('-salesCount')
      .limit(4 - recommendations.length)
      .select('name price images category ratings');

    recommendations = [...recommendations, ...extra];
  }

  // Optionally call ML for smarter recommendations
  try {
    const mlRes = await axios.post(`${ML_URL}/recommendations`, {
      product_id: req.params.productId,
      category: product.category,
      co_purchased_ids: productIds.map(String),
    }, { timeout: 5000 });

    if (mlRes.data?.recommended_ids?.length) {
      const mlProducts = await Product.find({
        _id: { $in: mlRes.data.recommended_ids },
        isActive: true,
      }).select('name price images category ratings');
      if (mlProducts.length > 0) recommendations = mlProducts;
    }
  } catch (err) {
    // Fall back to co-purchased results
  }

  res.json({ success: true, recommendations });
});

// @desc    Get expiry risk prediction
// @route   GET /api/ml/expiry-risk
// @access  Admin
const getExpiryRisk = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    expiryDate: { $gte: new Date() },
  }).select('name expiryDate stock salesCount category');

  try {
    const mlRes = await axios.post(`${ML_URL}/expiry-risk`, {
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        expiry_date: p.expiryDate,
        stock: p.stock.quantity,
        sales_rate: p.salesCount,
        category: p.category,
      })),
    }, { timeout: 15000 });

    res.json({ success: true, risks: mlRes.data });
  } catch (err) {
    res.status(503);
    throw new Error(
      `ML service unreachable (${ML_URL}). Start ml-api or set ML_API_URL.`
    );
  }
});

// @desc    Get inventory optimization suggestions
// @route   GET /api/ml/inventory-suggestions
// @access  Admin
const getInventorySuggestions = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .select('name stock salesCount category expiryDate');

  try {
    const mlRes = await axios.post(`${ML_URL}/inventory-optimize`, {
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        current_stock: p.stock.quantity,
        low_threshold: p.stock.lowStockThreshold,
        sales_count: p.salesCount,
        category: p.category,
      })),
    }, { timeout: 15000 });

    res.json({ success: true, suggestions: mlRes.data });
  } catch (err) {
    res.status(503);
    throw new Error(
      `ML service unreachable (${ML_URL}). Start ml-api or set ML_API_URL.`
    );
  }
});

module.exports = { getDemandForecast, getRecommendations, getExpiryRisk, getInventorySuggestions };
