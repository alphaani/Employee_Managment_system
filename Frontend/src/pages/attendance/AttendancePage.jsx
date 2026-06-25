import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentReport, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLogin, HiOutlineLogout } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDateTime } from '../../utils/helpers';
import { AuthContext } from '../../context/AuthContext';
import { attendanceService } from '../../services/attendance.service';

const AttendancePage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { isAdmin } = useContext(AuthContext);
  const endpoint = isAdmin ? '/attendance' : '/attendance/my';
  const { data: records, loading, refetch } = useFetch(endpoint, { params: { month } });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const todayRecord = records?.find((r) => {
    const today = new Date();
    const recDate = new Date(r.date);
    return recDate.toDateString() === today.toDateString();
  });
  const checkedIn = !!todayRecord;
  const checkedOut = checkedIn && !!todayRecord.checkOutTime;

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await attendanceService.checkIn();
      await refetch();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await attendanceService.checkOut();
      await refetch();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const stats = [
    { title: 'Present', value: records?.filter((r) => r.status === 'present').length || 0, icon: HiOutlineCheckCircle, color: 'green' },
    { title: 'Absent', value: records?.filter((r) => r.status === 'absent').length || 0, icon: HiOutlineXCircle, color: 'red' },
    { title: 'Late', value: records?.filter((r) => r.status === 'late').length || 0, icon: HiOutlineClock, color: 'yellow' },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={isAdmin ? 'Track employee attendance' : 'Your attendance records'}
        actions={
          <>
            {!isAdmin && (
              <div className="flex items-center gap-2">
                {actionError && <span className="text-sm text-red-500">{actionError}</span>}
                {!checkedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <HiOutlineLogin className="w-4 h-4" />
                    {actionLoading ? 'Checking in...' : 'Check In'}
                  </button>
                ) : !checkedOut ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    {actionLoading ? 'Checking out...' : 'Check Out'}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Done for today
                  </span>
                )}
              </div>
            )}
            {isAdmin && (
              <Link
                to="/attendance/report"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <HiOutlineDocumentReport className="w-4 h-4" />
                Reports
              </Link>
            )}
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6"
      >
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200"
      >
        <div className="p-4 border-b border-gray-200">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>

        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Check In</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Check Out</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records?.map((rec, i) => (
                  <motion.tr
                    key={rec._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.checkInTime ? formatDateTime(rec.checkInTime) : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.checkOutTime ? formatDateTime(rec.checkOutTime) : '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                  </motion.tr>
                ))}
                {(!records || records.length === 0) && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AttendancePage;
