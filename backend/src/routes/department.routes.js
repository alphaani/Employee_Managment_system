const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate, createDepartmentSchema, updateDepartmentSchema, assignEmployeesSchema } = require('../middleware/validate.middleware');

router.get('/', protect, authorize('admin'), departmentController.getAllDepartments);
router.get('/:id', protect, authorize('admin'), departmentController.getDepartment);
router.get('/:id/stats', protect, authorize('admin'), departmentController.getDepartmentStats);
router.post('/', protect, authorize('admin'), validate(createDepartmentSchema), departmentController.createDepartment);
router.put('/:id', protect, authorize('admin'), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);
router.post('/:id/employees', protect, authorize('admin'), validate(assignEmployeesSchema), departmentController.assignEmployees);

module.exports = router;
