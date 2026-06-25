const { Leave } = require('../models');
const AppError = require('../utils/AppError');

const submitLeave = async (employeeId, data) => {
  const { leaveType, startDate, endDate, reason } = data;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new AppError('Start date cannot be in the past', 400);
  }

  if (end < start) {
    throw new AppError('End date must be on or after start date', 400);
  }

  const overlapping = await Leave.findOne({
    employeeId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (overlapping) {
    throw new AppError(
      'You already have a pending or approved leave request for this date range',
      409
    );
  }

  const leave = await Leave.create({
    employeeId,
    leaveType,
    startDate: start,
    endDate: end,
    reason,
    status: 'pending',
  });

  return leave;
};

const getMyLeaves = async (employeeId, query) => {
  const { page = 1, limit = 10, status, leaveType, from, to } = query;

  const filter = { employeeId };
  if (status) filter.status = status;
  if (leaveType) filter.leaveType = leaveType;
  if (from || to) {
    filter.startDate = {};
    if (from) filter.startDate.$gte = new Date(from);
    if (to) filter.startDate.$lte = new Date(to);
  }

  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: leaves,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getAllLeaves = async (query) => {
  const {
    page = 1,
    limit = 10,
    status,
    employeeId,
    leaveType,
    from,
    to,
    sortBy = 'createdAt',
    order = 'desc',
  } = query;

  const filter = {};
  if (status) filter.status = status;
  if (employeeId) filter.employeeId = employeeId;
  if (leaveType) filter.leaveType = leaveType;
  if (from || to) {
    filter.startDate = {};
    if (from) filter.startDate.$gte = new Date(from);
    if (to) filter.startDate.$lte = new Date(to);
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: leaves,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getLeaveById = async (leaveId, employeeId) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  if (employeeId && leave.employeeId._id.toString() !== employeeId.toString()) {
    throw new AppError('Not authorized to view this leave request', 403);
  }
  return leave;
};

const approveLeave = async (leaveId, adminMessage) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  if (leave.status !== 'pending') {
    throw new AppError('Can only approve pending leave requests', 400);
  }

  leave.status = 'approved';
  if (adminMessage) leave.adminMessage = adminMessage;
  await leave.save();
  return leave;
};

const rejectLeave = async (leaveId, adminMessage) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  if (leave.status !== 'pending') {
    throw new AppError('Can only reject pending leave requests', 400);
  }

  leave.status = 'rejected';
  if (adminMessage) leave.adminMessage = adminMessage;
  await leave.save();
  return leave;
};

const deleteLeave = async (leaveId, employeeId) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  if (leave.employeeId._id.toString() !== employeeId.toString()) {
    throw new AppError('Not authorized to delete this leave request', 403);
  }
  if (leave.status !== 'pending') {
    throw new AppError('Can only delete pending leave requests', 400);
  }

  await Leave.findByIdAndDelete(leaveId);
  return { message: 'Leave request deleted' };
};

module.exports = {
  submitLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  deleteLeave,
};
