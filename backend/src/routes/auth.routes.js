const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/register', protect, authorize('admin'), authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
