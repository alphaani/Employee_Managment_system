import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineExclamation } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const LeaveListPage = () => {
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { isAdmin } = useContext(AuthContext);
  const endpoint = isAdmin ? '/leaves' : '/leaves/my';
  const { data: leaves, loading, refetch } = useFetch(endpoint);

  const filtered = leaves?.filter((l) => !filter || l.status === filter);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/leaves/${deleteTarget}`);
      setDeleteTarget(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      refetch();
    } catch (err) {
      alert(err.error || err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Leave Requests"
        subtitle={isAdmin ? `${leaves?.length || 0} total requests` : 'Your leave requests'}
        actions={
          <Link
            to="/leaves/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Request
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200"
      >
        <div className="p-4 border-b border-gray-200">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {isAdmin && <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Employee</th>}
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">From</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">To</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered?.map((l, i) => (
                  <motion.tr
                    key={l._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {isAdmin && <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.employeeId?.fullName || 'N/A'}</td>}
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{l.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={l.status} />
                      {l.adminMessage && (
                        <div className={`mt-2 text-xs p-2 rounded-lg ${
                          l.status === 'approved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className="font-medium">{l.status === 'approved' ? 'Approved' : 'Rejected'}:</span> {l.adminMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isAdmin && l.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteTarget(l._id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </motion.button>
                        )}
                        <Link
                          to={isAdmin && l.status === 'pending' ? '/leaves/approvals' : '#'}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {isAdmin && l.status === 'pending' ? 'Review' : 'View'}
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!filtered || filtered.length === 0) && (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-gray-500">No leave requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !deleting && setDeleteTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <HiOutlineExclamation className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Leave Request</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this leave request? This action cannot be undone.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm"
        >
          <span className="flex items-center gap-2">
            <HiOutlineTrash className="w-4 h-4 text-red-400" />
            Leave request deleted
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default LeaveListPage;
