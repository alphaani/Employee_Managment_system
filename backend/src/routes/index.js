const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const employeeRoutes = require('./employee.routes');
const departmentRoutes = require('./department.routes');
const attendanceRoutes = require('./attendance.routes');
const leaveRoutes = require('./leave.routes');
const payrollRoutes = require('./payroll.routes');
const performanceRoutes = require('./performance.routes');
const uploadRoutes = require('./upload.routes');
const dashboardRoutes = require('./dashboard.routes');
const analyticsRoutes = require('./analytics.routes');

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance', performanceRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
