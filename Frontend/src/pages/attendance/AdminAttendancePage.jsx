import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentReport, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineSearch, HiOutlineFilter, HiOutlineUserAdd,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/helpers';
import { attendanceService } from '../../services/attendance.service';

const AdminAttendancePage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [markingId, setMarkingId] = useState(null);
  const [deptFilter, setDeptFilter] = useState('');

  const { data: departments } = useFetch('/departments', { immediate: true });

  const dateParams = useMemo(() => {
    const [y, m] = month.split('-');
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0, 23, 59, 59, 999);
    const params = { from: from.toISOString(), to: to.toISOString() };
    if (deptFilter) params.departmentId = deptFilter;
    return params;
  }, [month, deptFilter]);

  const { data: records, loading, refetch } = useFetch('/attendance', { params: dateParams });
  const { data: dailyReport, loading: dailyLoading, refetch: refetchDaily } = useFetch('/attendance/reports/daily', { immediate: true });

  useEffect(() => {
    refetch(dateParams);
  }, [dateParams]);

  const presentCount = records?.filter((r) => r.status === 'present').length || 0;
  const lateCount = records?.filter((r) => r.status === 'late').length || 0;
  const absentCount = dailyReport?.summary?.absent || 0;
  const todayRecords = dailyReport?.records || [];
  const absentEmployees = dailyReport?.absentEmployees || [];

  const todayCheckedInIds = new Set(todayRecords.map((r) => r.employeeId?._id?.toString()));

  const todayAll = [
    ...todayRecords.map((r) => ({
      _id: r._id,
      employeeId: r.employeeId,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      status: r.status,
      date: r.date,
      isAbsent: false,
    })),
    ...absentEmployees.map((e) => ({
      _id: e._id,
      employeeId: e,
      checkInTime: null,
      checkOutTime: null,
      status: 'absent',
      date: dailyReport?.date,
      isAbsent: true,
    })),
  ];

  const filtered = records?.filter((r) =>
    !search || r.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMark = async (employeeId, status) => {
    setMarkingId(employeeId);
    try {
      await attendanceService.markAttendance({ employeeId, status });
      await Promise.all([refetch(), refetchDaily()]);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Track and manage employee attendance"
        actions={
          <Link
            to="/attendance/report"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <HiOutlineDocumentReport className="w-4 h-4" />
            Reports
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-5"
      >
        <StatCard title="Present" value={dailyReport?.summary?.present || 0} icon={HiOutlineCheckCircle} color="green" variant="gradient" subtitle={`${dailyReport?.summary?.total ? Math.round((dailyReport.summary.present || 0) / dailyReport.summary.total * 100) : 0}% of total`} />
        <StatCard title="Absent" value={absentCount} icon={HiOutlineXCircle} color="red" variant="gradient" subtitle={`${dailyReport?.summary?.total ? Math.round(absentCount / dailyReport.summary.total * 100) : 0}% of total`} />
        <StatCard title="Late" value={dailyReport?.summary?.late || 0} icon={HiOutlineClock} color="yellow" variant="gradient" subtitle={`${dailyReport?.summary?.total ? Math.round((dailyReport.summary.late || 0) / dailyReport.summary.total * 100) : 0}% of total`} />
        <StatCard title="Total" value={dailyReport?.summary?.total || 0} icon={HiOutlineUserAdd} color="primary" variant="gradient" subtitle="Active employees" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Today's Attendance</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {dailyReport?.date ? new Date(dailyReport.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
          </p>
        </div>

        {dailyLoading ? (
          <div className="p-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Check In</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Check Out</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todayAll.map((rec, i) => (
                  <motion.tr
                    key={rec._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`hover:bg-gray-50/50 transition-colors ${rec.isAbsent ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {rec.employeeId?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {rec.employeeId?.fullName || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {rec.checkInTime ? formatDateTime(rec.checkInTime) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {rec.checkOutTime ? formatDateTime(rec.checkOutTime) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {rec.isAbsent || rec.status === 'late' ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleMark(rec.employeeId?._id || rec.employeeId?.id, 'present')}
                            disabled={markingId === (rec.employeeId?._id || rec.employeeId?.id)}
                            className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                          >
                            {markingId === (rec.employeeId?._id || rec.employeeId?.id) ? '...' : 'Present'}
                          </button>
                          <button
                            onClick={() => handleMark(rec.employeeId?._id || rec.employeeId?.id, 'late')}
                            disabled={markingId === (rec.employeeId?._id || rec.employeeId?.id)}
                            className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleMark(rec.employeeId?._id || rec.employeeId?.id, 'half-day')}
                            disabled={markingId === (rec.employeeId?._id || rec.employeeId?.id)}
                            className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors"
                          >
                            Half-Day
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {todayAll.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500">No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <HiOutlineFilter className="w-4 h-4 text-gray-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-white"
            >
              <option value="">All Departments</option>
              {departments?.map((d) => (
                <option key={d._id} value={d._id}>{d.departmentName}</option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {filtered?.length || 0} records
          </span>
        </div>

        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Check In</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Check Out</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered?.map((rec, i) => (
                  <motion.tr
                    key={rec._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {rec.employeeId?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {rec.employeeId?.fullName || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.checkInTime ? formatDateTime(rec.checkInTime) : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.checkOutTime ? formatDateTime(rec.checkOutTime) : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  </motion.tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500">No attendance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminAttendancePage;
