const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/attendance', protect, authorize('admin'), analyticsController.getAttendanceAnalytics);
router.get('/payroll', protect, authorize('admin'), analyticsController.getPayrollAnalytics);
router.get('/departments', protect, authorize('admin'), analyticsController.getDepartmentAnalytics);
router.get('/performance', protect, authorize('admin'), analyticsController.getPerformanceAnalytics);

module.exports = router;
