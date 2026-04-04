const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

module.exports = router;
