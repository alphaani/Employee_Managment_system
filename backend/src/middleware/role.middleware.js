const AppError = require('../utils/AppError');

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
    if (!roles.includes(userRole)) {
      return next(new AppError('Not authorized to access this resource.', 403));
    }
    next();
  };
};

module.exports = { authorize };
