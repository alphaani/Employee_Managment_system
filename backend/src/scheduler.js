const cron = require('node-cron');
const { Attendance, Employee } = require('./models');

const markAbsentEmployees = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const [activeEmployees, todayAttendance] = await Promise.all([
      Employee.find({ status: 'active' }).select('_id fullName'),
      Attendance.find({ date: { $gte: yesterday, $lte: endOfYesterday } }).select('employeeId'),
    ]);

    const checkedInIds = new Set(todayAttendance.map((r) => r.employeeId.toString()));

    const absentEmployees = activeEmployees.filter((e) => !checkedInIds.has(e._id.toString()));

    if (absentEmployees.length === 0) return;

    const absentRecords = absentEmployees.map((emp) => ({
      employeeId: emp._id,
      date: yesterday,
      checkInTime: null,
      checkOutTime: null,
      status: 'absent',
    }));

    await Attendance.insertMany(absentRecords);
    console.log(`[Scheduler] Marked ${absentRecords.length} employees absent for ${yesterday.toDateString()}`);
  } catch (err) {
    console.error('[Scheduler] Error marking absent employees:', err.message);
  }
};

const startScheduler = () => {
  // Run every day at 00:05 (5 minutes after midnight)
  cron.schedule('5 0 * * *', () => {
    console.log('[Scheduler] Running daily absent marking...');
    markAbsentEmployees().catch((err) =>
      console.error('[Scheduler] Cron job error:', err.message)
    );
  });

  // Also run on startup for yesterday (in case server was down)
  markAbsentEmployees().catch((err) =>
    console.error('[Scheduler] Startup error:', err.message)
  );

  console.log('[Scheduler] Started — daily absent marking at 00:05');
};

module.exports = { startScheduler, markAbsentEmployees };
