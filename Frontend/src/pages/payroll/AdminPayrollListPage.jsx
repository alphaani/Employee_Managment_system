import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineCurrencyDollar, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineSearch, HiOutlineFilter,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { payrollService } from '../../services/payroll.service';

const AdminPayrollListPage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const dateParams = useMemo(() => {
    const [y, m] = month.split('-');
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [month]);

  const { data: payrolls, loading, refetch } = useFetch('/payroll', { params: dateParams });

  const totalAmount = payrolls?.reduce((sum, p) => sum + (p.netPay || p.totalSalary || p.grossPay || 0), 0) || 0;
  const paidCount = payrolls?.filter((p) => p.status === 'paid').length || 0;
  const pendingCount = payrolls?.filter((p) => p.status !== 'paid').length || 0;

  const filtered = payrolls?.filter((p) =>
    !search || p.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await payrollService.updateStatus(id, status);
      await refetch();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        subtitle="Manage employee salaries and payments"
        actions={
          <Link
            to="/payroll/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Generate Payroll
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        <StatCard title="Total Payroll" value={formatCurrency(totalAmount)} icon={HiOutlineCurrencyDollar} color="primary" variant="gradient" subtitle={`${payrolls?.length || 0} records this month`} />
        <StatCard title="Paid" value={paidCount} icon={HiOutlineCheckCircle} color="green" variant="gradient" subtitle={`${paidCount} employees paid`} />
        <StatCard title="Pending" value={pendingCount} icon={HiOutlineClock} color="yellow" variant="gradient" subtitle={`${pendingCount} awaiting payment`} />
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
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Period</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Gross Pay</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Net Pay</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered?.map((pr, i) => (
                  <motion.tr
                    key={pr._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-medium">
                          {pr.employeeId?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{pr.employeeId?.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pr.paymentDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatCurrency(pr.grossPay || pr.basicSalary)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{formatCurrency(pr.netPay || pr.totalSalary || pr.grossPay || pr.basicSalary)}</td>
                    <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {pr.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusUpdate(pr._id, 'paid')}
                            disabled={updatingId === pr._id}
                            className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            {updatingId === pr._id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                        <Link
                          to={`/payroll/${pr._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-500">No payroll records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPayrollListPage;
