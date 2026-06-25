const departmentService = require('../services/department.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllDepartments = catchAsync(async (req, res, next) => {
  const departments = await departmentService.getAllDepartments();
  res.status(200).json({
    success: true,
    data: departments,
  });
});

exports.getDepartment = catchAsync(async (req, res, next) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.createDepartment = catchAsync(async (req, res, next) => {
  const department = await departmentService.createDepartment(req.body);
  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

exports.updateDepartment = catchAsync(async (req, res, next) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department,
  });
});

exports.deleteDepartment = catchAsync(async (req, res, next) => {
  await departmentService.deleteDepartment(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Department deleted successfully',
  });
});

exports.assignEmployees = catchAsync(async (req, res, next) => {
  const result = await departmentService.assignEmployees(req.params.id, req.body.employeeIds);
  res.status(200).json({
    success: true,
    message: `${result.assignedCount} employee(s) assigned successfully`,
    data: result.department,
  });
});

exports.getDepartmentStats = catchAsync(async (req, res, next) => {
  const stats = await departmentService.getDepartmentStats(req.params.id);
  res.status(200).json({
    success: true,
    data: stats,
  });
});
