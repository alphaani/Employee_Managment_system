import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineClock, HiOutlineCalendar, HiOutlineCurrencyDollar,
  HiOutlineTrendingUp, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineArrowRight, HiOutlineSun, HiOutlineMoon,
  HiOutlineSparkles, HiOutlineBriefcase,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/helpers';

const attendanceTrend = [
  { name: 'Week 1', value: 5 }, { name: 'Week 2', value: 4 },
  { name: 'Week 3', value: 5 }, { name: 'Week 4', value: 3 },
  { name: 'Week 5', value: 5 },
];

const quickActions = [
  { label: 'Mark Attendance', path: '/attendance', icon: HiOutlineClock, desc: 'Clock in or out', gradient: 'from-blue-500 to-cyan-500' },
  { label: 'Request Leave', path: '/leaves/new', icon: HiOutlineCalendar, desc: 'Submit time off', gradient: 'from-purple-500 to-pink-500' },
  { label: 'View Payroll', path: '/payroll', icon: HiOutlineCurrencyDollar, desc: 'Check earnings', gradient: 'from-emerald-500 to-teal-500' },
  { label: 'My Performance', path: '/performance', icon: HiOutlineTrendingUp, desc: 'View reviews', gradient: 'from-amber-500 to-orange-500' },
];

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

const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: attendance, loading: loadAtt } = useFetch('/attendance/my', { params: { month: new Date().toISOString().slice(0, 7) } });
  const { data: leaves } = useFetch('/leaves/my');
  const { data: payroll } = useFetch('/payroll/my');
  const { data: performance } = useFetch('/performance/my');

  const presentCount = attendance?.filter((r) => r.status === 'present').length || 0;
  const absentCount = attendance?.filter((r) => r.status === 'absent').length || 0;
  const lateCount = attendance?.filter((r) => r.status === 'late').length || 0;
  const pendingLeaves = leaves?.filter((l) => l.status === 'pending').length || 0;
  const approvedLeaves = leaves?.filter((l) => l.status === 'approved').length || 0;
  const lastPayroll = payroll?.[0];
  const lastRating = performance?.[0]?.rating;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: HiOutlineSun };
    if (hour < 18) return { text: 'Good afternoon', icon: HiOutlineSparkles };
    return { text: 'Good evening', icon: HiOutlineMoon };
  }, []);

  const GreetingIcon = greeting.icon;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 translate-x-16 -translate-y-16 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 -translate-x-8 translate-y-8 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-white/5 rounded-full blur-xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <GreetingIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {greeting.text}, {user?.fullName?.split(' ')[0] || 'Employee'}
              </h1>
              <p className="text-sm text-blue-200 mt-0.5">
                Here's your overview for today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
              <p className="text-xs text-blue-200">Present</p>
              <p className="text-lg font-bold text-white">{presentCount}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
              <p className="text-xs text-blue-200">Pending</p>
              <p className="text-lg font-bold text-white">{pendingLeaves}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
              <p className="text-xs text-blue-200">Rating</p>
              <p className="text-lg font-bold text-white">{lastRating || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard title="Present This Month" value={presentCount} icon={HiOutlineCheckCircle} color="green" variant="glass" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Absent" value={absentCount} icon={HiOutlineXCircle} color="red" variant="glass" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Late" value={lateCount} icon={HiOutlineClock} color="yellow" variant="glass" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Approved Leaves" value={approvedLeaves} icon={HiOutlineBriefcase} color="purple" variant="glass" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
            <HiOutlineSparkles className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ x: 6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${action.gradient} opacity-5`} />
                <div className="relative flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-gray-900">{action.label}</span>
                    <p className="text-xs text-gray-400">{action.desc}</p>
                  </div>
                </div>
                <HiOutlineArrowRight className="relative w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </motion.button>
            ))}
          </div>

          {lastPayroll && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-5 text-white"
            >
              <div className="absolute top-0 right-0 w-40 h-40 translate-x-10 -translate-y-10 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-20 h-20 -translate-x-4 translate-y-4 bg-white/10 rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-blue-200">Latest Payroll</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(lastPayroll.totalSalary ?? lastPayroll.basicSalary)}</p>
                <p className="text-sm text-blue-200 mt-1">
                  {lastPayroll.paymentDate && new Date(lastPayroll.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {lastPayroll.status && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium capitalize">
                    <div className={`w-1.5 h-1.5 rounded-full ${lastPayroll.status === 'paid' ? 'bg-green-300' : 'bg-yellow-300'}`} />
                    {lastPayroll.status}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attendance Trend</p>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                {loadAtt ? '...' : `${presentCount} days`}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="attAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#attAreaGradient)"
                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Leave Activity</p>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {leaves?.length || 0} total
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              {leaves?.slice(0, 5).length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-100" />
                  <div className="space-y-4">
                    {leaves.slice(0, 5).map((leave, i) => (
                      <motion.div
                        key={leave._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative flex items-start gap-4 pl-8"
                      >
                        <div className={`absolute left-2 top-2.5 w-[18px] h-[18px] rounded-full border-2 border-white ${
                          leave.status === 'approved' ? 'bg-emerald-500' :
                          leave.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {leave.leaveType} Leave
                            </p>
                            <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                              leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              leave.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                            }`}>
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {leave.startDate && new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {leave.endDate && ` — ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <HiOutlineCalendar className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No leave activity yet</p>
                  <button
                    onClick={() => navigate('/leaves/new')}
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Request time off
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
