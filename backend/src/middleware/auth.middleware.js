const jwt = require('jsonwebtoken');
const { Admin, Employee } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. No token provided.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let user;
  if (decoded.role === 'admin') {
    user = await Admin.findById(decoded.id);
  } else {
    user = await Employee.findById(decoded.id);
  }

  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

module.exports = { protect };
