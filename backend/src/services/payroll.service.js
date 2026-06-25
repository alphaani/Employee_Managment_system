const { Payroll, Employee, Attendance } = require('../models');
const AppError = require('../utils/AppError');

const generatePayroll = async (data) => {
  const { employeeId, employeeIds, generateAll, month, year } = data;

  let targetEmployees = [];
  const payMonth = month || new Date().getMonth() + 1;
  const payYear = year || new Date().getFullYear();
  const paymentDate = new Date(payYear, payMonth - 1, 1);
  const startOfMonth = new Date(payYear, payMonth - 1, 1);
  const endOfMonth = new Date(payYear, payMonth, 0, 23, 59, 59, 999);

  if (generateAll) {
    targetEmployees = await Employee.find({ status: 'active' });
    if (targetEmployees.length === 0) {
      throw new AppError('No active employees found to generate payroll', 400);
    }
  } else if (employeeIds && employeeIds.length > 0) {
    targetEmployees = await Employee.find({ _id: { $in: employeeIds } });
    if (targetEmployees.length !== employeeIds.length) {
      throw new AppError('One or more employee IDs are invalid', 400);
    }
  } else if (employeeId) {
    const emp = await Employee.findById(employeeId);
    if (!emp) {
      throw new AppError('Employee not found', 404);
    }
    targetEmployees = [emp];
  } else {
    throw new AppError('Provide employeeId, employeeIds, or generateAll', 400);
  }

  const existingPayrolls = await Payroll.find({
    employeeId: { $in: targetEmployees.map((e) => e._id) },
    paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const existingIds = new Set(
    existingPayrolls.map((p) => p.employeeId.toString())
  );

  const created = [];
  const skipped = [];

  for (const emp of targetEmployees) {
    if (existingIds.has(emp._id.toString())) {
      skipped.push(emp.fullName);
      continue;
    }

    const dailyRate = emp.salary ? emp.salary / 30 : (data.basicSalary || 0) / 30;

    const attendanceRecords = await Attendance.find({
      employeeId: emp._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const absentDays = attendanceRecords.filter((r) => r.status === 'absent').length;
    const lateDays = attendanceRecords.filter((r) => r.status === 'late').length;
    const absenceDeduction = (absentDays * dailyRate) + (lateDays * dailyRate * 0.5);

    const overtimePay = (data.overtimeHours || 0) * (data.overtimeRate || 0);
    const otherTotal = (data.otherDeductions || []).reduce((s, d) => s + (d.amount || 0), 0);
    const deduction = (data.deduction || 0) + absenceDeduction;

    const payrollData = {
      employeeId: emp._id,
      basicSalary: data.basicSalary !== undefined ? data.basicSalary : emp.salary || 0,
      bonus: data.bonus || 0,
      overtimeHours: data.overtimeHours || 0,
      overtimeRate: data.overtimeRate || 0,
      deduction: Math.round(deduction * 100) / 100,
      tax: data.tax || 0,
      otherDeductions: data.otherDeductions || [],
      paymentMethod: data.paymentMethod || 'bank',
      bankName: data.bankName || '',
      bankAccount: data.bankAccount || '',
      paymentDate,
      status: data.status || 'pending',
    };

    const payroll = await Payroll.create(payrollData);
    created.push(payroll);
  }

  return {
    created: created.length,
    skipped: skipped.length,
    skippedEmployees: skipped,
    payrolls: created,
    month: payMonth,
    year: payYear,
  };
};

const getAllPayroll = async (query) => {
  const {
    page = 1,
    limit = 10,
    employeeId,
    status,
    from,
    to,
    sortBy = 'createdAt',
    order = 'desc',
  } = query;

  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (status) filter.status = status;
  if (from || to) {
    filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.paymentDate.$lte = endDate;
    }
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  const total = await Payroll.countDocuments(filter);
  const payrolls = await Payroll.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: payrolls,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getPayrollById = async (payrollId, employeeId) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new AppError('Payroll record not found', 404);
  }
  if (employeeId && payroll.employeeId._id.toString() !== employeeId.toString()) {
    throw new AppError('Not authorized to view this payroll record', 403);
  }
  return payroll;
};

const getMyPayroll = async (employeeId, query) => {
  const { page = 1, limit = 10, from, to } = query;

  const filter = { employeeId };
  if (from || to) {
    filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.paymentDate.$lte = endDate;
    }
  }

  const total = await Payroll.countDocuments(filter);
  const payrolls = await Payroll.find(filter)
    .sort({ paymentDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: payrolls,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const updatePayrollStatus = async (payrollId, status) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) {
    throw new AppError('Payroll record not found', 404);
  }

  payroll.status = status;
  await payroll.save();

  return payroll;
};

const getSalaryReport = async () => {
  const result = await Employee.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalSalary: { $sum: '$salary' },
        averageSalary: { $avg: '$salary' },
        minSalary: { $min: '$salary' },
        maxSalary: { $max: '$salary' },
      },
    },
  ]);

  const summary = result.length > 0 ? result[0] : {
    totalEmployees: 0, totalSalary: 0, averageSalary: 0, minSalary: 0, maxSalary: 0,
  };

  const departmentBreakdown = await Employee.aggregate([
    { $match: { status: 'active', salary: { $exists: true } } },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$department.departmentName',
        employeeCount: { $sum: 1 },
        totalSalary: { $sum: '$salary' },
        averageSalary: { $avg: '$salary' },
      },
    },
    { $sort: { totalSalary: -1 } },
  ]);

  return { summary, departmentBreakdown };
};

const getMonthlyReport = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);

  const records = await Payroll.find({
    paymentDate: { $gte: startDate, $lte: endDate },
  }).populate({
    path: 'employeeId',
    select: 'fullName email departmentId position',
  });

  const totalBasic = records.reduce((sum, r) => sum + r.basicSalary, 0);
  const totalBonus = records.reduce((sum, r) => sum + (r.bonus || 0), 0);
  const totalDeduction = records.reduce((sum, r) => sum + (r.deduction || 0), 0);
  const totalPaid = records.reduce((sum, r) => sum + (r.netPay || r.totalSalary || 0), 0);

  const statusBreakdown = {
    paid: records.filter((r) => r.status === 'paid').length,
    unpaid: records.filter((r) => r.status === 'unpaid').length,
    pending: records.filter((r) => r.status === 'pending').length,
  };

  return {
    summary: {
      month: m,
      year: y,
      totalEmployees: records.length,
      totalBasic,
      totalBonus,
      totalDeduction,
      totalPaid,
      statusBreakdown,
    },
    records,
  };
};

module.exports = {
  generatePayroll,
  getAllPayroll,
  getPayrollById,
  getMyPayroll,
  updatePayrollStatus,
  getSalaryReport,
  getMonthlyReport,
};
