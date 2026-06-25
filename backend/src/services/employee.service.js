const bcrypt = require('bcryptjs');
const { Employee, Attendance, Payroll, Leave, Performance } = require('../models');
const AppError = require('../utils/AppError');

const getAllEmployees = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    departmentId,
    status,
    gender,
    position,
    sortBy = 'createdAt',
    order = 'desc',
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
    ];
  }

  if (departmentId) filter.departmentId = departmentId;
  if (status) filter.status = status;
  if (gender) filter.gender = gender;
  if (position) filter.position = { $regex: position, $options: 'i' };

  const sortOrder = order === 'asc' ? 1 : -1;

  const total = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: employees,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

const createEmployee = async (data) => {
  const existing = await Employee.findOne({ email: data.email });
  if (existing) {
    throw new AppError('Employee with this email already exists', 409);
  }
  return Employee.create(data);
};

const updateEmployee = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }
  const employee = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

const deleteEmployee = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  await Promise.all([
    Attendance.deleteMany({ employeeId: id }),
    Payroll.deleteMany({ employeeId: id }),
    Leave.deleteMany({ employeeId: id }),
    Performance.deleteMany({ employeeId: id }),
  ]);

  await Employee.findByIdAndDelete(id);

  return { message: 'Employee and all related records deleted successfully' };
};

const updateProfile = async (id, data) => {
  const allowedFields = ['fullName', 'phoneNumber', 'gender', 'profileImage'];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const employee = await Employee.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  return employee;
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateProfile,
};
