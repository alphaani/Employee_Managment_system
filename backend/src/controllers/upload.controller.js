const uploadService = require('../services/upload.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.uploadProfileImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide an image file', 400));
  }

  const result = await uploadService.uploadProfileImage(req.user._id, req.file.buffer);
  res.status(200).json({
    success: true,
    message: 'Profile image uploaded successfully',
    data: result,
  });
});

exports.deleteProfileImage = catchAsync(async (req, res, next) => {
  const result = await uploadService.deleteProfileImage(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Profile image removed',
    data: result,
  });
});
