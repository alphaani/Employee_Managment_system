const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: rules.message || `${field} is required` });
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push({ field, message: `${field} must be an array` });
          continue;
        }
      } else if (rules.type && typeof value !== rules.type) {
        errors.push({ field, message: `${field} must be a ${rules.type}` });
        continue;
      }

      if (rules.enum && !rules.enum.includes(value)) {
        const valid = rules.enum.join(', ');
        errors.push({ field, message: `${field} must be one of: ${valid}` });
      }

      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} cannot exceed ${rules.maxLength} characters` });
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({ field, message: rules.patternMessage || `${field} is invalid` });
        }
      }

      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ field, message: `${field} must be at least ${rules.min}` });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ field, message: `${field} cannot exceed ${rules.max}` });
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 400));
    }

    next();
  };
};

const createEmployeeSchema = {
  fullName: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/, patternMessage: 'Invalid email format' },
  password: { required: true, type: 'string', minLength: 6 },
  phoneNumber: { type: 'string', pattern: /^\+?[\d\s\-()]{7,15}$/, patternMessage: 'Invalid phone number' },
  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
  position: { type: 'string', maxLength: 100 },
  departmentId: { type: 'string' },
  salary: { type: 'number', min: 0 },
  status: { type: 'string', enum: ['active', 'inactive'] },
};

const updateEmployeeSchema = {
  fullName: { type: 'string', minLength: 2, maxLength: 100 },
  email: { type: 'string', pattern: /^\S+@\S+\.\S+$/, patternMessage: 'Invalid email format' },
  phoneNumber: { type: 'string', pattern: /^\+?[\d\s\-()]{7,15}$/, patternMessage: 'Invalid phone number' },
  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
  position: { type: 'string', maxLength: 100 },
  departmentId: { type: 'string' },
  salary: { type: 'number', min: 0 },
  status: { type: 'string', enum: ['active', 'inactive'] },
};

const updateProfileSchema = {
  fullName: { type: 'string', minLength: 2, maxLength: 100 },
  phoneNumber: { type: 'string', pattern: /^\+?[\d\s\-()]{7,15}$/, patternMessage: 'Invalid phone number' },
  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
  profileImage: { type: 'string' },
};

const createDepartmentSchema = {
  departmentName: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  description: { type: 'string', maxLength: 500 },
  manager: { type: 'string', maxLength: 100 },
};

const updateDepartmentSchema = {
  departmentName: { type: 'string', minLength: 2, maxLength: 100 },
  description: { type: 'string', maxLength: 500 },
  manager: { type: 'string', maxLength: 100 },
};

const assignEmployeesSchema = {
  employeeIds: { required: true, type: 'array' },
};

const submitLeaveSchema = {
  leaveType: { required: true, type: 'string', enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'] },
  startDate: { required: true, type: 'string' },
  endDate: { required: true, type: 'string' },
  reason: { type: 'string', maxLength: 1000 },
};

const createPerformanceSchema = {
  employeeId: { required: true, type: 'string' },
  rating: { required: true, type: 'number', min: 1, max: 5 },
  feedback: { type: 'string', maxLength: 2000 },
  evaluationDate: { type: 'string' },
};

const updatePerformanceSchema = {
  rating: { type: 'number', min: 1, max: 5 },
  feedback: { type: 'string', maxLength: 2000 },
  evaluationDate: { type: 'string' },
};

const generatePayrollSchema = {
  employeeId: { type: 'string' },
  employeeIds: { type: 'array' },
  generateAll: { type: 'boolean' },
  basicSalary: { type: 'number', min: 0 },
  bonus: { type: 'number', min: 0 },
  deduction: { type: 'number', min: 0 },
  overtimeHours: { type: 'number', min: 0 },
  overtimeRate: { type: 'number', min: 0 },
  tax: { type: 'number', min: 0 },
  otherDeductions: { type: 'array' },
  paymentMethod: { type: 'string', enum: ['bank', 'cash', 'cheque'] },
  bankName: { type: 'string' },
  bankAccount: { type: 'string' },
  month: { type: 'number', min: 1, max: 12 },
  year: { type: 'number', min: 2020, max: 2100 },
  status: { type: 'string', enum: ['paid', 'unpaid', 'pending'] },
};

const updatePayrollStatusSchema = {
  status: { required: true, type: 'string', enum: ['paid', 'unpaid', 'pending'] },
};

module.exports = {
  validate,
  createEmployeeSchema, updateEmployeeSchema, updateProfileSchema,
  createDepartmentSchema, updateDepartmentSchema, assignEmployeesSchema,
  submitLeaveSchema,
  generatePayrollSchema, updatePayrollStatusSchema,
  createPerformanceSchema, updatePerformanceSchema,
};
