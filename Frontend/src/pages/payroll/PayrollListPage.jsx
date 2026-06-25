import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, formatCurrency } from '../../utils/helpers';

const PayrollListPage = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const dateParams = useMemo(() => {
    const [y, m] = month.split('-');
    const from = new Date(y, m - 1, 1);
    const to = new Date(y, m, 0, 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [month]);

  const { data: payrolls, loading } = useFetch('/payroll/my', { params: dateParams });

  return (
    <div>
      <PageHeader
        title="My Payroll"
        subtitle="Your payment history"
      />

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
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Period</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrolls?.map((pr, i) => (
                  <motion.tr
                    key={pr._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(pr.paymentDate)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(pr.netPay || pr.totalSalary || pr.grossPay || pr.basicSalary)}</td>
                    <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/payroll/${pr._id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View</Link>
                    </td>
                  </motion.tr>
                ))}
                {(!payrolls || payrolls.length === 0) && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No payroll records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PayrollListPage;
