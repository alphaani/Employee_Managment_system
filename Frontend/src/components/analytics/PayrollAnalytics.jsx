import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Spinner from '../ui/Spinner';
import { analyticsService } from '../../services/analytics.service';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const PayrollAnalytics = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { data, loading } = useFetch(
    () => analyticsService.getPayrollAnalytics({ year }),
    { deps: [year] }
  );

  if (loading) return <div className="p-8"><Spinner /></div>;
  if (!data) return null;

  const statusData = (data.statusSummary || []).map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.total,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm w-24"
          min={2020} max={2030}
        />
        <span className="text-sm text-gray-500">Annual total: {formatCurrency(data.totalAnnual)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Monthly Payroll Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="basicSalary" fill="#3b82f6" radius={[2, 2, 0, 0]} name="Basic" stackId="a" />
              <Bar dataKey="bonus" fill="#10b981" radius={[2, 2, 0, 0]} name="Bonus" stackId="a" />
              <Bar dataKey="deduction" fill="#ef4444" radius={[2, 2, 0, 0]} name="Deduction" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Payroll Status Breakdown</h4>
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
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Department Payroll Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.deptBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="_id" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="totalSalary" fill="#8b5cf6" name="Total Salary" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PayrollAnalytics;
