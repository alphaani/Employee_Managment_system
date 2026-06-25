const { Performance, Employee } = require('../models');
const AppError = require('../utils/AppError');

const createEvaluation = async (data) => {
  const { employeeId, rating, feedback, evaluationDate } = data;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return Performance.create({
    employeeId,
    rating,
    feedback,
    evaluationDate: evaluationDate || Date.now(),
  });
};

const getAllEvaluations = async (query) => {
  const {
    page = 1,
    limit = 10,
    employeeId,
    rating,
    from,
    to,
    sortBy = 'evaluationDate',
    order = 'desc',
  } = query;

  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (rating) filter.rating = Number(rating);
  if (from || to) {
    filter.evaluationDate = {};
    if (from) filter.evaluationDate.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.evaluationDate.$lte = endDate;
    }
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  const total = await Performance.countDocuments(filter);
  const evaluations = await Performance.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: evaluations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getEvaluationById = async (evaluationId, employeeId) => {
  const evaluation = await Performance.findById(evaluationId);
  if (!evaluation) {
    throw new AppError('Evaluation not found', 404);
  }
  if (employeeId && evaluation.employeeId._id.toString() !== employeeId.toString()) {
    throw new AppError('Not authorized to view this evaluation', 403);
  }
  return evaluation;
};

const getMyEvaluations = async (employeeId, query) => {
  const { page = 1, limit = 10 } = query;

  const filter = { employeeId };

  const total = await Performance.countDocuments(filter);
  const evaluations = await Performance.find(filter)
    .sort({ evaluationDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: evaluations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const updateEvaluation = async (evaluationId, data) => {
  const evaluation = await Performance.findById(evaluationId);
  if (!evaluation) {
    throw new AppError('Evaluation not found', 404);
  }

  if (data.rating !== undefined) evaluation.rating = data.rating;
  if (data.feedback !== undefined) evaluation.feedback = data.feedback;
  if (data.evaluationDate !== undefined) evaluation.evaluationDate = data.evaluationDate;

  await evaluation.save();
  return evaluation;
};

const deleteEvaluation = async (evaluationId) => {
  const evaluation = await Performance.findById(evaluationId);
  if (!evaluation) {
    throw new AppError('Evaluation not found', 404);
  }

  await Performance.findByIdAndDelete(evaluationId);
  return { message: 'Evaluation deleted successfully' };
};

module.exports = {
  createEvaluation,
  getAllEvaluations,
  getEvaluationById,
  getMyEvaluations,
  updateEvaluation,
  deleteEvaluation,
};
