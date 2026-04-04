const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true,
  },
  genericName: { type: String, trim: true },
  brand: { type: String, trim: true },
  description: { type: String },
  category: {
    type: String,
    required: true,
    enum: [
      "Fever & Cold",
      "Diabetes",
      "Heart Care",
      "Vitamins",
      "Antibiotics",
      "Pain Relief",
      "Skin Care",
      "Digestive",
      "Eye & Ear"
    ],
  },
  price: {
    mrp: { type: Number, required: true },
    selling: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // percentage
  },
  batchNo: { type: String, trim: true },
  image: { type: String },
  images: [{ url: String, public_id: String }],
  stock: {
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'strip' },
    lowStockThreshold: { type: Number, default: 10 },
  },
  expiryDate: { type: Date },
  requiresPrescription: { type: Boolean, default: false },
  manufacturer: { type: String },
  composition: { type: String },
  dosage: { type: String },
  form: { 
    type: String, 
    enum: ['tablet', 'syrup', 'cream', 'drops', 'gel', 'capsule', 'injection', 'powder'],
    default: 'tablet'
  },
  sideEffects: { type: String },
  storageInstructions: { type: String },
  tags: [String],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  salesCount: { type: Number, default: 0 },
  isBestSelling: { type: Boolean, default: false },
}, { timestamps: true });

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function () {
  return Math.round(((this.price.mrp - this.price.selling) / this.price.mrp) * 100);
});

// Index for search
productSchema.index({ name: 'text', genericName: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
