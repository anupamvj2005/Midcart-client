const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

/** Avoids MongoDB $text (requires a text index — missing index caused 500 on some Atlas DBs). */
const buildSearchOr = (raw) => {
  const q = raw != null && String(raw).trim();
  if (!q) return null;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(escaped, 'i');
  return [{ name: rx }, { genericName: rx }, { brand: rx }, { tags: rx }];
};

const SORT_MAP = {
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  '-price.selling': { 'price.selling': -1 },
  'price.selling': { 'price.selling': 1 },
  '-salesCount': { salesCount: -1 },
  salesCount: { salesCount: 1 },
  '-ratings.average': { 'ratings.average': -1 },
  'ratings.average': { 'ratings.average': 1 },
};

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search, category, minPrice, maxPrice,
    requiresPrescription, page = 1, limit = 12,
    sort = '-createdAt', featured
  } = req.query;

  const query = { isActive: true };

  const searchOr = buildSearchOr(search);
  if (searchOr) {
    query.$or = searchOr;
  }
  if (category) query.category = category;
  if (requiresPrescription !== undefined) query.requiresPrescription = requiresPrescription === 'true';
  if (featured) query.isFeatured = true;
  if (minPrice || maxPrice) {
    query['price.selling'] = {};
    if (minPrice) query['price.selling'].$gte = Number(minPrice);
    if (maxPrice) query['price.selling'].$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;
  const sortObj = SORT_MAP[String(sort)] || { createdAt: -1 };

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .select('-reviews');

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('reviews.user', 'name');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

const { DEFAULT_PRODUCT_PHOTO, productImageUrl } = require('../utils/productSeedData');
const DEFAULT_PRODUCT_IMAGE = productImageUrl(DEFAULT_PRODUCT_PHOTO);

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  if (!req.body.images?.length) {
    req.body.images = [{ url: DEFAULT_PRODUCT_IMAGE, public_id: 'default' }];
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product deactivated' });
});

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  product.reviews.push({ user: req.user._id, rating, comment });
  product.ratings.count = product.reviews.length;
  product.ratings.average = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stock.quantity', '$stock.lowStockThreshold'] },
  }).select('name stock price');

  res.json({ success: true, products });
});

// @desc    Get near-expiry products
// @route   GET /api/products/near-expiry
// @access  Admin
const getNearExpiryProducts = asyncHandler(async (req, res) => {
  const thirtyDaysFromNow = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000);

  const products = await Product.find({
    isActive: true,
    expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
  }).select('name expiryDate stock');

  res.json({ success: true, products });
});

// @desc    Get best selling products
// @route   GET /api/products/best or /api/medicines/best
// @access  Public
const getBestSellingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isBestSelling: true }).limit(8);
  res.json({ success: true, products });
});

module.exports = {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getLowStockProducts, getNearExpiryProducts,
  getBestSellingProducts
};
