import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';

const AttendanceReportPage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data: report, loading } = useFetch('/attendance/reports/monthly', { params: { month } });

  const chartData = report?.dailyRecords || [];

  return (
    <div>
      <PageHeader title="Attendance Report" subtitle="Monthly attendance summary" />

      <div className="mb-6">
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Overview</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
            </BarChart>
          </ResponsiveContainer>

          {report?.summary && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{report.summary.totalPresent || 0}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{report.summary.totalAbsent || 0}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{report.summary.totalLate || 0}</p>
                <p className="text-xs text-gray-500">Late</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceReportPage;
