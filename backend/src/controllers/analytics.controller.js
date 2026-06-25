const analyticsService = require('../services/analytics.service');
const catchAsync = require('../utils/catchAsync');

exports.getAttendanceAnalytics = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  const data = await analyticsService.getAttendanceAnalytics(year, month);
  res.status(200).json({ success: true, data });
});

exports.getPayrollAnalytics = catchAsync(async (req, res) => {
  const { year } = req.query;
  const data = await analyticsService.getPayrollAnalytics(year);
  res.status(200).json({ success: true, data });
});

exports.getDepartmentAnalytics = catchAsync(async (req, res) => {
  const data = await analyticsService.getDepartmentAnalytics();
  res.status(200).json({ success: true, data });
});

exports.getPerformanceAnalytics = catchAsync(async (req, res) => {
  const data = await analyticsService.getPerformanceAnalytics();
  res.status(200).json({ success: true, data });
});
