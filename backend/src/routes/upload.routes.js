const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/profile-image', protect, upload.single('profileImage'), uploadController.uploadProfileImage);
router.delete('/profile-image', protect, uploadController.deleteProfileImage);

module.exports = router;
