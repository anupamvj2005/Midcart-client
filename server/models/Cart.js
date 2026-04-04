const mongoose = require('mongoose');
const { computeCouponDiscount } = require('../utils/coupon');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: Number, // snapshot at time of adding
    prescriptionRequired: Boolean,
  }],
  coupon: {
    code: String,
    discount: Number,
    type: { type: String, enum: ['percent', 'flat'] },
    maxDiscount: Number,
  },
}, { timestamps: true });

// Calculate totals virtual
cartSchema.virtual('totals').get(function () {
  const subtotal = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = computeCouponDiscount(subtotal, this.coupon);
  const deliveryCharge = subtotal > 199 ? 0 : 49;
  const total = subtotal - discount + deliveryCharge;
  return { subtotal, discount, deliveryCharge, total };
});

module.exports = mongoose.model('Cart', cartSchema);
