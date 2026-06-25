const employeeService = require('../services/employee.service');
const catchAsync = require('../utils/catchAsync');

exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const result = await employeeService.getAllEmployees(req.query);
  res.status(200).json({
    success: true,
    message: 'Employees fetched successfully',
    ...result,
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.createEmployee = catchAsync(async (req, res, next) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee,
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee,
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully',
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const employee = await employeeService.getEmployeeById(req.user._id);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const employee = await employeeService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: employee,
  });
});
