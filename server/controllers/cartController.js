const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name images price stock requiresPrescription');

  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }

  res.json({ success: true, cart });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.stock.quantity < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  );

  if (existingItem) {
    const nextQty = existingItem.quantity + quantity;
    if (product.stock.quantity < nextQty) {
      res.status(400);
      throw new Error('Not enough stock for this quantity');
    }
    existingItem.quantity = nextQty;
    existingItem.price = product.price.selling;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price.selling,
      prescriptionRequired: product.requiresPrescription,
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock requiresPrescription');

  res.json({ success: true, cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find(
    item => item.product.toString() === req.params.productId
  );

  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name images price stock requiresPrescription');

  res.json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.json({ success: true, cart: { items: [] } });
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json({ success: true, cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] }, $unset: { coupon: 1 } }
  );
  res.json({ success: true, message: 'Cart cleared' });
});

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Simple coupon logic - extend with Coupon model for production
  const coupons = {
    'FIRST20': { discount: 20, type: 'percent', maxDiscount: 100 },
    'SAVE50': { discount: 50, type: 'flat' },
    'HEALTH10': { discount: 10, type: 'percent', maxDiscount: 200 },
  };

  const coupon = coupons[code.toUpperCase()];
  if (!coupon) {
    res.status(400);
    throw new Error('Invalid coupon code');
  }

  const payload = { code: code.toUpperCase(), ...coupon };

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { coupon: payload }, $setOnInsert: { user: req.user._id, items: [] } },
    { new: true, upsert: true }
  );

  await cart.populate('items.product', 'name images price stock requiresPrescription');

  res.json({ success: true, cart, coupon: payload });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
