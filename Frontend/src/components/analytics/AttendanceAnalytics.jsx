import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Spinner from '../ui/Spinner';
import { analyticsService } from '../../services/analytics.service';
import { useFetch } from '../../hooks/useFetch';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AttendanceAnalytics = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [year, monthNum] = month.split('-');
  const { data, loading } = useFetch(
    () => analyticsService.getAttendanceAnalytics({ year, month: monthNum }),
    { deps: [month] }
  );

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (!data) return null;

  const statusData = Object.entries(data.statusDistribution || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Daily Attendance Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" radius={[2, 2, 0, 0]} name="Present" />
              <Bar dataKey="late" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Late" />
              <Bar dataKey="absent" fill="#ef4444" radius={[2, 2, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Status Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                paddingAngle={3} dataKey="value"
              >
                {statusData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Comparison (6 months)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Present" />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Late" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Department Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deptBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
