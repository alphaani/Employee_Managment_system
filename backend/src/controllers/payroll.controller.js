const payrollService = require('../services/payroll.service');
const catchAsync = require('../utils/catchAsync');

exports.generatePayroll = catchAsync(async (req, res, next) => {
  const result = await payrollService.generatePayroll(req.body);
  res.status(201).json({
    success: true,
    message: `Payroll generated for ${result.created} employee(s)${result.skipped > 0 ? `. ${result.skipped} skipped (already exists).` : ''}`,
    data: result,
  });
});

exports.getAllPayroll = catchAsync(async (req, res, next) => {
  const result = await payrollService.getAllPayroll(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getPayroll = catchAsync(async (req, res, next) => {
  const userRole = req.user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
  const employeeId = userRole === 'employee' ? req.user._id : undefined;
  const payroll = await payrollService.getPayrollById(req.params.id, employeeId);
  res.status(200).json({
    success: true,
    data: payroll,
  });
});

exports.getMyPayroll = catchAsync(async (req, res, next) => {
  const result = await payrollService.getMyPayroll(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.updatePayrollStatus = catchAsync(async (req, res, next) => {
  const payroll = await payrollService.updatePayrollStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: `Payroll status updated to ${req.body.status}`,
    data: payroll,
  });
});

exports.getSalaryReport = catchAsync(async (req, res, next) => {
  const report = await payrollService.getSalaryReport();
  res.status(200).json({
    success: true,
    data: report,
  });
});

exports.getMonthlyReport = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  if (!year || !month) {
    const now = new Date();
    const report = await payrollService.getMonthlyReport(
      month || now.getMonth() + 1,
      year || now.getFullYear()
    );
    return res.status(200).json({ success: true, data: report });
  }
  const report = await payrollService.getMonthlyReport(month, year);
  res.status(200).json({
    success: true,
    data: report,
  });
});
