const express = require('express');
const router = express.Router();
const { uploadPrescription, getMyPrescriptions, getPrescription, getAllPrescriptions, verifyPrescription } = require('../controllers/prescriptionController');
const { protect, pharmacist } = require('../middleware/authMiddleware');
const { uploadPrescription: upload } = require('../config/cloudinary');

router.post('/', protect, upload.array('images', 5), uploadPrescription);
router.get('/my', protect, getMyPrescriptions);
router.get('/', protect, pharmacist, getAllPrescriptions);
router.get('/:id', protect, getPrescription);
router.put('/:id/verify', protect, pharmacist, verifyPrescription);

module.exports = router;
