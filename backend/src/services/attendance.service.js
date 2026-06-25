const { Attendance, Employee } = require('../models');
const AppError = require('../utils/AppError');

const OFFICE_START_HOUR = 9;

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const checkIn = async (employeeId) => {
  const { start: todayStart } = getTodayRange();

  const existing = await Attendance.findOne({
    employeeId,
    date: { $gte: todayStart },
  });

  if (existing) {
    throw new AppError('Already checked in today', 400);
  }

  const now = new Date();
  const officeStart = new Date();
  officeStart.setHours(OFFICE_START_HOUR, 0, 0, 0);

  const status = now > officeStart ? 'late' : 'present';

  const attendance = await Attendance.create({
    employeeId,
    checkInTime: now,
    date: now,
    status,
  });

  return attendance;
};

const checkOut = async (employeeId) => {
  const { start: todayStart } = getTodayRange();

  const record = await Attendance.findOne({
    employeeId,
    date: { $gte: todayStart },
  });

  if (!record) {
    throw new AppError('No check-in record found for today. Please check in first.', 400);
  }

  if (record.checkOutTime) {
    throw new AppError('Already checked out today', 400);
  }

  record.checkOutTime = new Date();

  if (record.checkOutTime <= record.checkInTime) {
    throw new AppError('Check-out time must be after check-in time', 400);
  }

  await record.save();
  return record;
};

const getMyAttendance = async (employeeId, query) => {
  const { page = 1, limit = 10, from, to } = query;

  const filter = { employeeId };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.date.$lte = endDate;
    }
  }

  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getAllAttendance = async (query) => {
  const {
    page = 1,
    limit = 10,
    employeeId,
    status,
    departmentId,
    from,
    to,
    sortBy = 'date',
    order = 'desc',
  } = query;

  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      filter.date.$lte = endDate;
    }
  }
  if (departmentId) {
    const deptEmployees = await Employee.find({ departmentId }).select('_id');
    filter.employeeId = { $in: deptEmployees.map((e) => e._id) };
  }

  const sortOrder = order === 'asc' ? 1 : -1;

  const total = await Attendance.countDocuments(filter);
  const records = await Attendance.find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDailyReport = async (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const isPast = date < new Date(new Date().toDateString());

  const [attendanceRecords, activeEmployees] = await Promise.all([
    Attendance.find({
      date: { $gte: date, $lte: endDate },
    }).populate({
      path: 'employeeId',
      select: 'fullName email departmentId profileImage',
    }),
    Employee.find({ status: 'active' }).select('fullName email departmentId profileImage'),
  ]);

  const checkedInIds = new Set(
    attendanceRecords.map((r) => r.employeeId._id.toString())
  );

  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const halfDayCount = attendanceRecords.filter((r) => r.status === 'half-day').length;

  let absentCount;
  let absentEmployees;

  if (isPast) {
    // For past days, count actual absent records from DB (auto-marked by scheduler)
    absentCount = attendanceRecords.filter((r) => r.status === 'absent').length;
    absentEmployees = [];
  } else {
    // For today, calculate absents from active employees minus checked-in
    absentCount = activeEmployees.length - checkedInIds.size;
    absentEmployees = activeEmployees.filter((e) => !checkedInIds.has(e._id.toString()));
  }

  return {
    date,
    summary: {
      total: activeEmployees.length,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      halfDay: halfDayCount,
    },
    records: attendanceRecords,
    absentEmployees,
  };
};

const getMonthlyReport = async (year, month) => {
  const y = parseInt(year);
  const m = parseInt(month);

  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);
  const totalWorkingDays = endDate.getDate();

  const [records, activeCount] = await Promise.all([
    Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate({
      path: 'employeeId',
      select: 'fullName email departmentId profileImage',
    }),
    Employee.countDocuments({ status: 'active' }),
  ]);

  const employeeMap = {};
  for (const record of records) {
    const eid = record.employeeId._id.toString();
    if (!employeeMap[eid]) {
      employeeMap[eid] = {
        employee: record.employeeId,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        totalWorkingDays,
      };
    }
    if (record.status === 'present') employeeMap[eid].present++;
    else if (record.status === 'late') employeeMap[eid].late++;
    else if (record.status === 'absent') employeeMap[eid].absent++;
    else if (record.status === 'half-day') employeeMap[eid].halfDay++;
  }

  const allActiveEmployees = await Employee.find({ status: 'active' }).select(
    '_id fullName email departmentId'
  );

  for (const emp of allActiveEmployees) {
    const eid = emp._id.toString();
    if (!employeeMap[eid]) {
      employeeMap[eid] = {
        employee: emp,
        present: 0,
        late: 0,
        absent: 0,
        halfDay: 0,
        totalWorkingDays,
      };
    }
    const empData = employeeMap[eid];
    empData.absent =
      totalWorkingDays - (empData.present + empData.late + empData.halfDay);
  }

  const totalPresent = Object.values(employeeMap).reduce(
    (sum, e) => sum + e.present,
    0
  );
  const totalLate = Object.values(employeeMap).reduce((sum, e) => sum + e.late, 0);
  const totalAbsent = Object.values(employeeMap).reduce(
    (sum, e) => sum + e.absent,
    0
  );
  const totalHalfDay = Object.values(employeeMap).reduce(
    (sum, e) => sum + e.halfDay,
    0
  );

  return {
    summary: {
      totalEmployees: activeCount,
      totalWorkingDays,
      totalPresent,
      totalLate,
      totalAbsent,
      totalHalfDay,
      attendanceRate: activeCount > 0
        ? Math.round(
            ((totalPresent + totalLate) / (activeCount * totalWorkingDays)) * 10000
          ) / 100
        : 0,
    },
    employees: Object.values(employeeMap),
    month: m,
    year: y,
  };
};

const markAttendance = async (employeeId, data) => {
  const { status, date: dateStr } = data;
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  const existing = await Attendance.findOne({
    employeeId,
    date: { $gte: targetDate, $lte: endDate },
  });

  if (existing) {
    existing.status = status || existing.status;
    if (!existing.checkInTime) existing.checkInTime = new Date();
    await existing.save();
    return existing;
  }

  const attendance = await Attendance.create({
    employeeId,
    date: targetDate,
    status: status || 'present',
    checkInTime: new Date(),
  });

  return attendance;
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getDailyReport,
  getMonthlyReport,
  markAttendance,
};
