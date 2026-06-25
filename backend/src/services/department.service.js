const { Department, Employee, Performance } = require('../models');
const AppError = require('../utils/AppError');

const getAllDepartments = async () => {
  const departments = await Department.find().populate('employeeCount');
  return departments;
};

const getDepartmentById = async (id) => {
  const department = await Department.findById(id)
    .populate('employeeCount')
    .populate({
      path: 'employees',
      select: 'fullName email position salary profileImage status',
    });
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  return department;
};

const createDepartment = async (data) => {
  const existing = await Department.findOne({ departmentName: data.departmentName });
  if (existing) {
    throw new AppError('Department with this name already exists', 409);
  }
  return Department.create(data);
};

const updateDepartment = async (id, data) => {
  if (data.departmentName) {
    const existing = await Department.findOne({
      departmentName: data.departmentName,
      _id: { $ne: id },
    });
    if (existing) {
      throw new AppError('Department with this name already exists', 409);
    }
  }

  const department = await Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('employeeCount');

  if (!department) {
    throw new AppError('Department not found', 404);
  }
  return department;
};

const deleteDepartment = async (id) => {
  const department = await Department.findById(id);
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const employeeCount = await Employee.countDocuments({ departmentId: id });
  if (employeeCount > 0) {
    throw new AppError(
      'Cannot delete department with assigned employees. Reassign or remove employees first.',
      400
    );
  }

  await Department.findByIdAndDelete(id);
  return { message: 'Department deleted successfully' };
};

const assignEmployees = async (departmentId, employeeIds) => {
  const department = await Department.findById(departmentId);
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const validEmployees = await Employee.find({ _id: { $in: employeeIds } });
  if (validEmployees.length !== employeeIds.length) {
    throw new AppError('One or more employee IDs are invalid', 400);
  }

  await Employee.updateMany(
    { _id: { $in: employeeIds } },
    { $set: { departmentId } }
  );

  const updatedDepartment = await Department.findById(departmentId).populate('employeeCount');

  return {
    department: updatedDepartment,
    assignedCount: validEmployees.length,
  };
};

const getDepartmentStats = async (departmentId) => {
  const department = await Department.findById(departmentId).populate('employeeCount');
  if (!department) {
    throw new AppError('Department not found', 404);
  }

  const employees = await Employee.find({ departmentId });
  const employeeIds = employees.map((e) => e._id);

  const activeEmployees = employees.filter((e) => e.status === 'active');
  const inactiveEmployees = employees.filter((e) => e.status === 'inactive');

  const salaries = employees
    .map((e) => e.salary)
    .filter((s) => s != null);

  const salaryTotal = salaries.reduce((a, b) => a + b, 0);
  const salarySummary = {
    total: salaryTotal,
    average: salaries.length ? Math.round((salaryTotal / salaries.length) * 100) / 100 : 0,
    min: salaries.length ? Math.min(...salaries) : 0,
    max: salaries.length ? Math.max(...salaries) : 0,
  };

  let performanceData = {
    averageRating: null,
    totalEvaluations: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  if (employeeIds.length > 0) {
    const performances = await Performance.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalEvaluations: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    if (performances.length > 0) {
      const p = performances[0];
      performanceData.averageRating = Math.round(p.averageRating * 100) / 100;
      performanceData.totalEvaluations = p.totalEvaluations;
      p.ratings.forEach((r) => {
        performanceData.ratingDistribution[r] =
          (performanceData.ratingDistribution[r] || 0) + 1;
      });
    }
  }

  return {
    department,
    employees: {
      total: employees.length,
      active: activeEmployees.length,
      inactive: inactiveEmployees.length,
    },
    salary: salarySummary,
    performance: performanceData,
    summary: {
      totalEmployees: employees.length,
      monthlyPayroll: salaryTotal,
      averagePerformance: performanceData.averageRating,
      departmentsCount: 1,
    },
  };
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignEmployees,
  getDepartmentStats,
};
