const attendanceService = require('../services/attendance.service');
const catchAsync = require('../utils/catchAsync');

exports.checkIn = catchAsync(async (req, res, next) => {
  const attendance = await attendanceService.checkIn(req.user._id);
  res.status(201).json({
    success: true,
    message: 'Check-in successful',
    data: attendance,
  });
});

exports.checkOut = catchAsync(async (req, res, next) => {
  const attendance = await attendanceService.checkOut(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Check-out successful',
    data: attendance,
  });
});

exports.getMyAttendance = catchAsync(async (req, res, next) => {
  const result = await attendanceService.getMyAttendance(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getAllAttendance = catchAsync(async (req, res, next) => {
  const result = await attendanceService.getAllAttendance(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getDailyReport = catchAsync(async (req, res, next) => {
  const report = await attendanceService.getDailyReport(req.query.date);
  res.status(200).json({
    success: true,
    data: report,
  });
});

exports.markAttendance = catchAsync(async (req, res, next) => {
  const attendance = await attendanceService.markAttendance(req.body.employeeId, req.body);
  res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance,
  });
});

exports.getMonthlyReport = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  if (!year || !month) {
    const now = new Date();
    return res.status(200).json({
      success: true,
      data: await attendanceService.getMonthlyReport(
        year || now.getFullYear(),
        month || now.getMonth() + 1
      ),
    });
  }
  const report = await attendanceService.getMonthlyReport(year, month);
  res.status(200).json({
    success: true,
    data: report,
  });
});
