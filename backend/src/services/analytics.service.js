const { Attendance, Payroll, Employee, Department, Performance, Leave } = require('../models');

const getAttendanceAnalytics = async (year, month) => {
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || new Date().getMonth() + 1;

  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);

  const records = await Attendance.find({
    date: { $gte: startDate, $lte: endDate },
  });

  const dailyTrends = [];
  const daysInMonth = endDate.getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStart = new Date(y, m - 1, d);
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
    const dayRecords = records.filter(
      (r) => r.date >= dayStart && r.date <= dayEnd
    );
    dailyTrends.push({
      date: `${m}/${d}`,
      present: dayRecords.filter((r) => r.status === 'present').length,
      late: dayRecords.filter((r) => r.status === 'late').length,
      absent: dayRecords.filter((r) => r.status === 'absent').length,
      halfDay: dayRecords.filter((r) => r.status === 'half-day').length,
    });
  }

  const statusDistribution = {
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
    'half-day': records.filter((r) => r.status === 'half-day').length,
  };

  const deptBreakdown = await Attendance.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $lookup: {
        from: 'departments',
        localField: 'employee.departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$department.departmentName', 'Unassigned'] },
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const ym = new Date(y, m - 1 - i, 1);
    const my = ym.getMonth();
    const yy = ym.getFullYear();
    const ms = new Date(yy, my, 1);
    const me = new Date(yy, my + 1, 0, 23, 59, 59, 999);
    const monthRecs = await Attendance.find({ date: { $gte: ms, $lte: me } });
    monthlyTrends.push({
      month: `${my + 1}/${yy}`,
      present: monthRecs.filter((r) => r.status === 'present').length,
      late: monthRecs.filter((r) => r.status === 'late').length,
      absent: monthRecs.filter((r) => r.status === 'absent').length,
      total: monthRecs.length,
    });
  }

  return { dailyTrends, statusDistribution, deptBreakdown, monthlyTrends };
};

const getPayrollAnalytics = async (year) => {
  const y = parseInt(year) || new Date().getFullYear();

  const monthlyTotals = [];
  for (let m = 1; m <= 12; m++) {
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59, 999);
    const records = await Payroll.find({
      paymentDate: { $gte: startDate, $lte: endDate },
    });
    monthlyTotals.push({
      month: `${m}/${y}`,
      basicSalary: records.reduce((s, r) => s + r.basicSalary, 0),
      bonus: records.reduce((s, r) => s + (r.bonus || 0), 0),
      deduction: records.reduce((s, r) => s + (r.deduction || 0), 0),
      totalSalary: records.reduce((s, r) => s + (r.netPay || r.totalSalary || 0), 0),
      count: records.length,
    });
  }

  const statusSummary = await Payroll.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: { $ifNull: ['$netPay', { $ifNull: ['$totalSalary', 0] }] } },
      },
    },
  ]);

  const deptBreakdown = await Payroll.aggregate([
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $lookup: {
        from: 'departments',
        localField: 'employee.departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$department.departmentName', 'Unassigned'] },
        totalSalary: { $sum: { $ifNull: ['$netPay', { $ifNull: ['$totalSalary', 0] }] } },
        avgSalary: { $avg: { $ifNull: ['$netPay', { $ifNull: ['$totalSalary', 0] }] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSalary: -1 } },
  ]);

  const totalAnnual = monthlyTotals.reduce((s, m) => s + m.totalSalary, 0);

  return { monthlyTotals, statusSummary, deptBreakdown, totalAnnual };
};

const getDepartmentAnalytics = async () => {
  const departments = await Department.find();

  const deptStats = await Promise.all(
    departments.map(async (dept) => {
      const employees = await Employee.find({
        departmentId: dept._id,
        status: 'active',
      });

      const empIds = employees.map((e) => e._id);
      const [attendanceCount, payrollTotal, perfAgg] = await Promise.all([
        Attendance.countDocuments({ employeeId: { $in: empIds } }),
        Payroll.aggregate([
          { $match: { employeeId: { $in: empIds } } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$netPay', { $ifNull: ['$totalSalary', 0] }] } } } },
        ]),
        Performance.aggregate([
          { $match: { employeeId: { $in: empIds } } },
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]),
      ]);

      return {
        name: dept.departmentName,
        employeeCount: employees.length,
        totalSalary: employees.reduce((s, e) => s + (e.salary || 0), 0),
        avgSalary: employees.length > 0
          ? Math.round((employees.reduce((s, e) => s + (e.salary || 0), 0) / employees.length) * 100) / 100
          : 0,
        attendanceRecords: attendanceCount,
        payrollTotal: payrollTotal[0]?.total || 0,
        avgRating: perfAgg[0] ? Math.round(perfAgg[0].avg * 100) / 100 : 0,
        performanceCount: perfAgg[0]?.count || 0,
        employees: employees.map((e) => ({
          _id: e._id,
          fullName: e.fullName,
          position: e.position,
          salary: e.salary,
        })),
      };
    })
  );

  const totalEmployees = deptStats.reduce((s, d) => s + d.employeeCount, 0);
  const totalSalary = deptStats.reduce((s, d) => s + d.totalSalary, 0);

  return {
    departments: deptStats,
    summary: {
      totalDepartments: departments.length,
      totalEmployees,
      totalSalary,
      avgSalary: totalEmployees > 0 ? Math.round((totalSalary / totalEmployees) * 100) / 100 : 0,
    },
  };
};

const getPerformanceAnalytics = async () => {
  const evaluations = await Performance.find().populate({
    path: 'employeeId',
    select: 'fullName departmentId',
  });

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  evaluations.forEach((e) => {
    if (ratingDistribution[e.rating] !== undefined) ratingDistribution[e.rating]++;
  });

  const averageRating =
    evaluations.length > 0
      ? Math.round(
          (evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length) * 100
        ) / 100
      : 0;

  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthEvals = evaluations.filter(
      (e) => e.evaluationDate >= start && e.evaluationDate <= end
    );
    monthlyTrends.push({
      month: `${d.getMonth() + 1}/${d.getFullYear()}`,
      count: monthEvals.length,
      average:
        monthEvals.length > 0
          ? Math.round(
              (monthEvals.reduce((s, e) => s + e.rating, 0) / monthEvals.length) * 100
            ) / 100
          : 0,
    });
  }

  const deptBreakdown = await Performance.aggregate([
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $lookup: {
        from: 'departments',
        localField: 'employee.departmentId',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$department.departmentName', 'Unassigned'] },
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
    { $sort: { averageRating: -1 } },
  ]);

  return {
    summary: { totalEvaluations: evaluations.length, averageRating, ratingDistribution },
    monthlyTrends,
    deptBreakdown,
  };
};

module.exports = {
  getAttendanceAnalytics,
  getPayrollAnalytics,
  getDepartmentAnalytics,
  getPerformanceAnalytics,
};
