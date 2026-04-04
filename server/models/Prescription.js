const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  images: [{
    url: { type: String, required: true },
    public_id: String,
  }],
  doctorName: String,
  patientName: String,
  prescriptionDate: Date,
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  rejectionReason: String,
  extractedMedicines: [{
    name: String,
    dosage: String,
    quantity: String,
    matchedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    /** Combined OCR + catalog match confidence (0–1) */
    confidence: Number,
    ocrConfidence: Number,
    matchScore: Number,
  }],
  /** AI / OCR pipeline status for this upload */
  analysisStatus: {
    type: String,
    enum: ['completed', 'partial', 'unavailable'],
    default: 'unavailable',
  },
  analysisNote: String,
  rawOCRText: String,
  notes: String,
  validUntil: {
    type: Date,
    default: () => new Date(+new Date() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
  },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
