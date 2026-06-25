const performanceService = require('../services/performance.service');
const catchAsync = require('../utils/catchAsync');

exports.createEvaluation = catchAsync(async (req, res, next) => {
  const evaluation = await performanceService.createEvaluation(req.body);
  res.status(201).json({
    success: true,
    message: 'Evaluation created successfully',
    data: evaluation,
  });
});

exports.getAllEvaluations = catchAsync(async (req, res, next) => {
  const result = await performanceService.getAllEvaluations(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.getEvaluation = catchAsync(async (req, res, next) => {
  const userRole = req.user.constructor.modelName === 'Admin' ? 'admin' : 'employee';
  const employeeId = userRole === 'employee' ? req.user._id : undefined;
  const evaluation = await performanceService.getEvaluationById(req.params.id, employeeId);
  res.status(200).json({
    success: true,
    data: evaluation,
  });
});

exports.getMyEvaluations = catchAsync(async (req, res, next) => {
  const result = await performanceService.getMyEvaluations(req.user._id, req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

exports.updateEvaluation = catchAsync(async (req, res, next) => {
  const evaluation = await performanceService.updateEvaluation(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Evaluation updated successfully',
    data: evaluation,
  });
});

exports.deleteEvaluation = catchAsync(async (req, res, next) => {
  await performanceService.deleteEvaluation(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Evaluation deleted successfully',
  });
});
