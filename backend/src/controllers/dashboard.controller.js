const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});
