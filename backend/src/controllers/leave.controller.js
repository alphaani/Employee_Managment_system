const leaveService = require('../services/leave.service');
const catchAsync = require('../utils/catchAsync');

exports.submitLeave = catchAsync(async (req, res, next) => {
  const leave = await leaveService.submitLeave(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Leave request submitted successfully',
    data: leave,
  });
});

exports.getMyLeaves = catchAsync(async (req, res, next) => {
  const result = await leaveService.getMyLeaves(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getAllLeaves = catchAsync(async (req, res, next) => {
  const result = await leaveService.getAllLeaves(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getLeave = catchAsync(async (req, res, next) => {
  const userRole = req.user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
  const employeeId = userRole === 'employee' ? req.user._id : undefined;
  const leave = await leaveService.getLeaveById(req.params.id, employeeId);
  res.status(200).json({
    success: true,
    data: leave,
  });
});

exports.approveLeave = catchAsync(async (req, res, next) => {
  const leave = await leaveService.approveLeave(req.params.id, req.body.adminMessage);
  res.status(200).json({
    success: true,
    message: 'Leave request approved',
    data: leave,
  });
});

exports.rejectLeave = catchAsync(async (req, res, next) => {
  const leave = await leaveService.rejectLeave(req.params.id, req.body.adminMessage);
  res.status(200).json({
    success: true,
    message: 'Leave request rejected',
    data: leave,
  });
});

exports.deleteLeave = catchAsync(async (req, res, next) => {
  await leaveService.deleteLeave(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Leave request deleted',
  });
});
