import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Spinner from '../ui/Spinner';
import { analyticsService } from '../../services/analytics.service';
import { useFetch } from '../../hooks/useFetch';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6'];

const PerformanceAnalytics = () => {
  const { data, loading } = useFetch(() => analyticsService.getPerformanceAnalytics());

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (!data) return null;

  const ratingDistData = Object.entries(data.summary?.ratingDistribution || {}).map(([rating, count]) => ({
    name: `${rating} Star`,
    value: count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.summary?.totalEvaluations}</p>
          <p className="text-xs text-gray-500">Total Evaluations</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{data.summary?.averageRating}</p>
          <p className="text-xs text-gray-500">Average Rating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {data.summary?.ratingDistribution?.[5] || 0}
          </p>
          <p className="text-xs text-gray-500">5-Star Ratings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Rating Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ratingDistData}
                cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                paddingAngle={3} dataKey="value" nameKey="name"
              >
                {ratingDistData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Avg Rating" />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Evaluations" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Department Performance Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deptBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 5]} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(value) => `${value} / 5`} />
              <Bar dataKey="averageRating" fill="#8b5cf6" name="Avg Rating" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
