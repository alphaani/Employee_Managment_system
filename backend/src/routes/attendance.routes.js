const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.post('/check-in', protect, authorize('employee'), attendanceController.checkIn);
router.post('/check-out', protect, authorize('employee'), attendanceController.checkOut);
router.get('/my', protect, authorize('employee'), attendanceController.getMyAttendance);

router.post('/mark', protect, authorize('admin'), attendanceController.markAttendance);
router.get('/', protect, authorize('admin'), attendanceController.getAllAttendance);
router.get('/reports/daily', protect, authorize('admin'), attendanceController.getDailyReport);
router.get('/reports/monthly', protect, authorize('admin'), attendanceController.getMonthlyReport);

module.exports = router;
