const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate, generatePayrollSchema, updatePayrollStatusSchema } = require('../middleware/validate.middleware');

router.get('/my', protect, authorize('employee'), payrollController.getMyPayroll);
router.get('/reports/salary', protect, authorize('admin'), payrollController.getSalaryReport);
router.get('/reports/monthly', protect, authorize('admin'), payrollController.getMonthlyReport);

router.get('/', protect, authorize('admin'), payrollController.getAllPayroll);
router.get('/:id', protect, payrollController.getPayroll);
router.post('/', protect, authorize('admin'), validate(generatePayrollSchema), payrollController.generatePayroll);
router.patch('/:id/status', protect, authorize('admin'), validate(updatePayrollStatusSchema), payrollController.updatePayrollStatus);

module.exports = router;
