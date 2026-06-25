const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate, createEmployeeSchema, updateEmployeeSchema, updateProfileSchema } = require('../middleware/validate.middleware');

router.get('/profile', protect, authorize('employee'), employeeController.getProfile);
router.put('/profile', protect, authorize('employee'), validate(updateProfileSchema), employeeController.updateProfile);

router.get('/', protect, authorize('admin'), employeeController.getAllEmployees);
router.get('/:id', protect, authorize('admin'), employeeController.getEmployee);
router.post('/', protect, authorize('admin'), validate(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', protect, authorize('admin'), validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', protect, authorize('admin'), employeeController.deleteEmployee);

module.exports = router;
