const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { computeCouponDiscount } = require('../utils/coupon');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment, prescription, coupon, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate stock and calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.stock.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = product.price.selling;
    subtotal += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      quantity: item.quantity,
      price,
      requiresPrescription: product.requiresPrescription,
    });
  }

  const discount = computeCouponDiscount(subtotal, coupon);
  const deliveryCharge = subtotal > 199 ? 0 : 49;
  const total = subtotal - discount + deliveryCharge;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    prescription,
    shippingAddress,
    pricing: { subtotal, discount, deliveryCharge, total },
    coupon: coupon?.code
      ? { code: coupon.code, discount }
      : undefined,
    payment: payment || { method: 'cod' },
    notes,
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
    estimatedDelivery: new Date(+new Date() + 3 * 24 * 60 * 60 * 1000), // 3 days
  });

  // Deduct stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'stock.quantity': -item.quantity, salesCount: item.quantity },
    });
  }

  // Clear cart and coupon
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] }, $unset: { coupon: 1 } }
  );

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');
  res.status(201).json({ success: true, order: populatedOrder });
});

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('items.product', 'name images');

  res.json({ success: true, orders, total });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user can only see their own orders (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!['placed', 'confirmed'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by user' });
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'stock.quantity': item.quantity, salesCount: -item.quantity },
    });
  }

  res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('user', 'name email');

  res.json({ success: true, orders, total });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  order.statusHistory.push({ status, note });
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();
  res.json({ success: true, order });
});

module.exports = {
  createOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus,
};
