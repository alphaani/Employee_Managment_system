import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineClock,
  HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineTrendingUp,
  HiOutlineBadgeCheck, HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/helpers';
import { dashboardService } from '../../services/dashboard.service';
import { analyticsService } from '../../services/analytics.service';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const DashboardPage = () => {
  const [year] = useState(new Date().getFullYear());
  const [month] = useState(new Date().getMonth() + 1);

  const { data: dashboard, loading: dashLoading } = useFetch(() => dashboardService.getStats(), { deps: [] });
  const { data: analytics, loading: analyticsLoading } = useFetch(
    () => analyticsService.getAttendanceAnalytics({ year, month }),
    { deps: [year, month] }
  );

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }, []);

  const stats = useMemo(() => {
    if (!dashboard) return [];
    const o = dashboard.overview || {};
    const p = dashboard.payroll || {};
    return [
      { title: 'Total Employees', value: o.totalEmployees?.toString() || '0', icon: HiOutlineUsers, color: 'primary', trend: null, subtitle: `${o.totalDepartments || 0} departments` },
      { title: 'Present Today', value: o.presentToday?.toString() || '0', icon: HiOutlineBadgeCheck, color: 'green', trend: null, subtitle: `${o.absentToday || 0} absent today` },
      { title: 'Pending Requests', value: o.pendingLeaves?.toString() || '0', icon: HiOutlineExclamationCircle, color: 'yellow', trend: null, subtitle: 'Leave requests' },
      { title: 'Payroll This Month', value: formatCurrency(p.total || 0), icon: HiOutlineCurrencyDollar, color: 'blue', trend: null, subtitle: `${p.records || 0} records` },
    ];
  }, [dashboard]);

  const monthlyChartData = useMemo(() => {
    const trends = analytics?.monthlyTrends || [];
    return trends.map((t) => ({
      name: t.month,
      present: t.present,
      late: t.late,
      absent: t.absent,
    })).reverse();
  }, [analytics]);

  const deptData = useMemo(() => {
    const depts = dashboard?.departments || [];
    return depts.map((d, i) => ({
      name: d.departmentName || 'Unassigned',
      value: d.employeeCount || 0,
      color: COLORS[i % COLORS.length],
    }));
  }, [dashboard]);

  const activities = useMemo(() => {
    const leaves = dashboard?.leaves?.recentRequests || [];
    return leaves.map((l) => ({
      user: l.employeeId?.fullName || 'Unknown',
      initials: (l.employeeId?.fullName || '?').split(' ').map(n => n[0]).join('').slice(0, 2),
      action: 'submitted leave request',
      time: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
      type: 'leave',
    }));
  }, [dashboard]);

  const typeStyles = {
    leave: 'bg-purple-100 text-purple-600',
    review: 'bg-emerald-100 text-emerald-600',
    profile: 'bg-blue-100 text-blue-600',
    attendance: 'bg-amber-100 text-amber-600',
    request: 'bg-rose-100 text-rose-600',
  };

  const typeIcons = {
    leave: '📋',
    review: '⭐',
    profile: '👤',
    attendance: '⏰',
    request: '📦',
  };

  if (dashLoading || analyticsLoading) {
    return <div className="p-12"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{today}</p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <StatCard {...stat} variant="gradient" />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Trends</h3>
              <p className="text-sm text-gray-500">Monthly present/late/absent</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {monthlyChartData.length > 0 ? `${monthlyChartData[monthlyChartData.length - 1]?.present || 0} this month` : ''}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} name="Present" />
              <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} name="Late" />
              <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
              <p className="text-sm text-gray-500">This month daily breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={(analytics?.dailyTrends || []).slice(-7)}>
              <defs>
                <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Absent" />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Late" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Department Distribution</h3>
              <p className="text-sm text-gray-500">Headcount by department</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {deptData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full lg:w-48 space-y-3">
              {deptData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{d.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-sm font-bold text-gray-900">
                    {deptData.reduce((sum, d) => sum + d.value, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest leave requests</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100" />
            <div className="space-y-5">
              {activities.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
              )}
              {activities.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="relative flex items-start gap-4 pl-10"
                >
                  <div className={`absolute left-2.5 w-4 h-4 rounded-full border-2 border-white mt-1.5 ${typeStyles[activity.type].split(' ')[0].replace('bg-', 'bg-')}`}>
                    <div className={`w-full h-full rounded-full ${typeStyles[activity.type].split(' ')[0]}`} />
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${typeStyles[activity.type]} flex items-center justify-center flex-shrink-0 text-sm`}>
                      {activity.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                    <span className="text-lg">{typeIcons[activity.type]}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Pending Requests</p>
              <p className="text-xl font-bold text-amber-500">{dashboard?.leaves?.pending || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Performance</p>
              <p className="text-xl font-bold text-blue-500">{dashboard?.performance?.averageRating || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Evaluations</p>
              <p className="text-xl font-bold text-purple-500">{dashboard?.performance?.totalEvaluations || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
