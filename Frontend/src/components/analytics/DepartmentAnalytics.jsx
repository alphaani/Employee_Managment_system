import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Spinner from '../ui/Spinner';
import { analyticsService } from '../../services/analytics.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

const DepartmentAnalytics = () => {
  const { data, loading } = useFetch(() => analyticsService.getDepartmentAnalytics());

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (!data) return null;

  const headcountData = (data.departments || []).map((d) => ({
    name: d.name,
    employees: d.employeeCount,
  }));

  const salaryData = (data.departments || []).map((d) => ({
    name: d.name,
    totalSalary: d.totalSalary,
    avgSalary: d.avgSalary,
  }));

  const ratingData = (data.departments || []).filter((d) => d.avgRating > 0).map((d) => ({
    name: d.name,
    rating: d.avgRating,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.summary?.totalDepartments}</p>
          <p className="text-xs text-gray-500">Departments</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{data.summary?.totalEmployees}</p>
          <p className="text-xs text-gray-500">Employees</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{formatCurrency(data.summary?.totalSalary)}</p>
          <p className="text-xs text-gray-500">Total Salary</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary?.avgSalary)}</p>
          <p className="text-xs text-gray-500">Avg Salary</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Headcount by Department</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={headcountData}
                cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                paddingAngle={3} dataKey="employees" nameKey="name"
              >
                {headcountData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {headcountData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {d.name} ({d.employees})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Salary by Department</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="totalSalary" fill="#8b5cf6" name="Total Salary" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Average Salary by Department</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="avgSalary" fill="#10b981" name="Avg Salary" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Average Performance Rating by Department</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 5]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(value) => `${value} / 5`} />
              <Bar dataKey="rating" fill="#f59e0b" name="Avg Rating" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;
