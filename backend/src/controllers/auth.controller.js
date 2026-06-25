const jwt = require('jsonwebtoken');
const { Admin, Employee } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

const createSendToken = (user, statusCode, res) => {
  const role = user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
  const token = signToken(user._id, role);

  const userObj = user.toObject();
  userObj.role = role;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError('Please provide fullName, email and password', 400));
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    return next(new AppError('Admin with this email already exists', 409));
  }

  const admin = await Admin.create({ fullName, email, password });

  createSendToken(admin, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  let user = await Employee.findOne({ email }).select('+password');

  if (user) {
    if (user.status === 'inactive') {
      return next(new AppError('Your account has been deactivated. Contact admin.', 401));
    }
    const isMatch = await user.comparePassword(password);
    if (isMatch) return createSendToken(user, 200, res);
  }

  user = await Admin.findOne({ email }).select('+password');
  if (user) {
    const isMatch = await user.comparePassword(password);
    if (isMatch) return createSendToken(user, 200, res);
  }

  return next(new AppError('Invalid email or password', 401));
});

exports.getMe = catchAsync(async (req, res, next) => {
  const userObj = req.user.toObject();
  userObj.role = req.user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
  res.status(200).json({
    success: true,
    user: userObj,
  });
});
