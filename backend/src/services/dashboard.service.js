const {
  Employee,
  Department,
  Attendance,
  Leave,
  Payroll,
  Performance,
} = require('../models');

const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const [
    totalEmployees,
    totalDepartments,
    todayAttendance,
    pendingLeaves,
    monthlyPayroll,
    performanceAgg,
    departmentWiseCount,
    recentLeaves,
  ] = await Promise.all([
    Employee.countDocuments({ status: 'active' }),
    Department.countDocuments(),
    Attendance.find({
      date: { $gte: today, $lte: endOfToday },
    }).select('status'),
    Leave.countDocuments({ status: 'pending' }),
    Payroll.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$netPay', { $ifNull: ['$totalSalary', 0] }] } },
          count: { $sum: 1 },
        },
      },
    ]),
    Performance.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalEvaluations: { $sum: 1 },
          ratings: { $push: '$rating' },
        },
      },
    ]),
    Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
          totalSalary: { $sum: '$salary' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          departmentName: { $ifNull: ['$department.departmentName', 'Unassigned'] },
          employeeCount: '$count',
          totalSalary: 1,
        },
      },
      { $sort: { employeeCount: -1 } },
    ]),
    Leave.find({ status: 'pending' })
      .populate({
        path: 'employeeId',
        select: 'fullName email departmentId',
      })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const presentCount = todayAttendance.filter((r) => r.status === 'present').length;
  const lateCount = todayAttendance.filter((r) => r.status === 'late').length;
  const halfDayCount = todayAttendance.filter((r) => r.status === 'half-day').length;
  const totalPresent = presentCount + lateCount + halfDayCount;
  const absentCount = totalEmployees - totalPresent;

  let averageRating = 0;
  let totalEvaluations = 0;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (performanceAgg.length > 0) {
    const p = performanceAgg[0];
    averageRating = Math.round(p.averageRating * 100) / 100;
    totalEvaluations = p.totalEvaluations;
    p.ratings.forEach((r) => {
      if (ratingDistribution[r] !== undefined) ratingDistribution[r]++;
    });
  }

  return {
    overview: {
      totalEmployees,
      totalDepartments,
      presentToday: totalPresent,
      absentToday: absentCount,
      pendingLeaves,
    },
    employees: {
      total: totalEmployees,
      present: presentCount,
      late: lateCount,
      halfDay: halfDayCount,
      absent: absentCount,
    },
    departments: departmentWiseCount,
    payroll:
      monthlyPayroll.length > 0
        ? {
            total: Math.round(monthlyPayroll[0].total * 100) / 100,
            records: monthlyPayroll[0].count,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          }
        : {
            total: 0,
            records: 0,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          },
    leaves: {
      pending: pendingLeaves,
      recentRequests: recentLeaves,
    },
    performance: {
      averageRating,
      totalEvaluations,
      ratingDistribution,
    },
  };
};

module.exports = { getDashboardStats };
