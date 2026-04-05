const path = require('path');
const fs = require('fs');
const multer = require('multer');

/**
 * Real Cloudinary = all three vars set and not .env.example placeholders.
 * Otherwise prescriptions upload to local disk (uploads/prescriptions) — no API key needed.
 */
function isCloudinaryConfigured() {
  const name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const key = (process.env.CLOUDINARY_API_KEY || '').trim();
  const secret = (process.env.CLOUDINARY_API_SECRET || '').trim();
  if (!name || !key || !secret) return false;
  const placeholders = [
    'your_cloud_name',
    'your_api_key',
    'your_api_secret',
    'xxx',
  ];
  if (placeholders.includes(name) || placeholders.includes(key) || placeholders.includes(secret)) {
    return false;
  }
  return true;
}

const prescriptionsDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
const productsDir = path.join(__dirname, '..', 'uploads', 'products');

let uploadPrescription;
let uploadProduct;
let cloudinary = null;

if (isCloudinaryConfigured()) {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const prescriptionStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'midcart/prescriptions',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto',
    },
  });

  const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'midcart/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
  });

  uploadPrescription = multer({ storage: prescriptionStorage });
  uploadProduct = multer({ storage: productStorage });
} else {
  fs.mkdirSync(prescriptionsDir, { recursive: true });
  fs.mkdirSync(productsDir, { recursive: true });

  const rxFilter = (req, file, cb) => {
    const ok =
      /^(image\/(jpeg|jpg|png|webp)|application\/pdf)$/i.test(file.mimetype || '') ||
      /\.(jpe?g|png|pdf|webp)$/i.test(file.originalname || '');
    if (ok) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP or PDF allowed for prescriptions'));
  };

  const prescriptionDisk = multer.diskStorage({
    destination: (req, file, cb) => cb(null, prescriptionsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.jpg';
      cb(null, `rx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
    },
  });

  uploadPrescription = multer({
    storage: prescriptionDisk,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: rxFilter,
  });

  const productDisk = multer.diskStorage({
    destination: (req, file, cb) => cb(null, productsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.jpg';
      cb(null, `pd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
    },
  });

  uploadProduct = multer({
    storage: productDisk,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok =
        /^image\//i.test(file.mimetype || '') ||
        /\.(jpe?g|png|webp)$/i.test(file.originalname || '');
      if (ok) cb(null, true);
      else cb(new Error('Only image files allowed'));
    },
  });

  if (process.env.NODE_ENV !== 'test') {
    console.log(
      'ℹ️  Prescription uploads: local disk (uploads/prescriptions). Set real Cloudinary env vars for cloud storage.'
    );
  }
}

module.exports = {
  cloudinary,
  uploadPrescription,
  uploadProduct,
  useLocalUploads: !isCloudinaryConfigured(),
};
