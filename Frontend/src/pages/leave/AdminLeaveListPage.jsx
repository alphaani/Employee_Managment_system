import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineClock, HiOutlineSearch, HiOutlineCheck, HiOutlineX,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';

const AdminLeaveListPage = () => {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [actionTarget, setActionTarget] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const { data: leaves, loading, refetch } = useFetch('/leaves');

  useEffect(() => {
    api.get('/departments').then((res) => {
      const d = res?.data;
      setDepartments(Array.isArray(d) ? d : []);
    });
  }, []);

  const totalLeaves = leaves?.length || 0;
  const pendingCount = leaves?.filter((l) => l.status === 'pending').length || 0;
  const approvedCount = leaves?.filter((l) => l.status === 'approved').length || 0;
  const rejectedCount = leaves?.filter((l) => l.status === 'rejected').length || 0;

  const filtered = leaves?.filter((l) => {
    const matchStatus = !filter || l.status === filter;
    const matchSearch = !search || l.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase());
    const matchDept = !departmentFilter || l.employeeId?.departmentId?._id === departmentFilter;
    return matchStatus && matchSearch && matchDept;
  });

  const confirmAction = async () => {
    if (!actionTarget) return;
    try {
      await api.patch(`/leaves/${actionTarget.id}/${actionTarget.action}`, { adminMessage });
      setActionTarget(null);
      setAdminMessage('');
      refetch();
    } catch (err) {
      alert(err.error || err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle={`${totalLeaves} total requests — ${pendingCount} pending`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatCard title="Total Requests" value={totalLeaves} icon={HiOutlineCalendar} color="primary" variant="gradient" />
        <StatCard title="Pending" value={pendingCount} icon={HiOutlineClock} color="yellow" variant="gradient" />
        <StatCard title="Approved" value={approvedCount} icon={HiOutlineCheckCircle} color="green" variant="gradient" />
        <StatCard title="Rejected" value={rejectedCount} icon={HiOutlineXCircle} color="red" variant="gradient" />
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
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.departmentName}</option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            {filtered?.length || 0} requests
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
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">From</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">To</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Reason</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered?.map((l, i) => (
                  <motion.tr
                    key={l._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {l.employeeId?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                          <span className="text-sm font-medium text-gray-900">{l.employeeId?.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{l.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 min-w-[180px]">
                      <p>{l.reason || '—'}</p>
                      {l.adminMessage && (
                        <p className={`mt-1 text-xs ${
                          l.status === 'approved' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          <span className="font-medium">Response:</span> {l.adminMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {l.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActionTarget({ id: l._id, action: 'approve' })}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Approve"
                          >
                            <HiOutlineCheck className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActionTarget({ id: l._id, action: 'reject' })}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <HiOutlineX className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {l.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                  {(!filtered || filtered.length === 0) && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-500">No leave requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setActionTarget(null); setAdminMessage(''); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {actionTarget.action === 'approve' ? 'Approve Leave' : 'Reject Leave'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {actionTarget.action === 'approve' ? 'Approve this leave request?' : 'Reject this leave request?'}
            </p>
            <textarea
              placeholder="Optional message to the employee..."
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setActionTarget(null); setAdminMessage(''); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  actionTarget.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionTarget.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveListPage;
