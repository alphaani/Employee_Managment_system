import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';

const LeaveApprovalPage = () => {
  const { data: leaves, loading, refetch } = useFetch('/leaves', { params: { status: 'pending' } });
  const [actionTarget, setActionTarget] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');

  const confirmAction = async () => {
    if (!actionTarget) return;
    try {
      if (actionTarget.action === 'approve') await api.patch(`/leaves/${actionTarget.id}/approve`, { adminMessage });
      else await api.patch(`/leaves/${actionTarget.id}/reject`, { adminMessage });
      setActionTarget(null);
      setAdminMessage('');
      refetch();
    } catch (err) {
      alert(err.error || err.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <PageHeader title="Leave Approvals" subtitle="Review pending leave requests" />

      {loading ? (
        <div className="p-12"><Spinner /></div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {leaves?.map((l, i) => (
            <motion.div
              key={l._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {l.employeeId?.fullName?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{l.employeeId?.fullName}</p>
                      <p className="text-xs text-gray-500 capitalize">{l.leaveType} Leave</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(l.startDate)} - {formatDate(l.endDate)}
                  </p>
                  {l.reason && <p className="text-sm text-gray-500 mt-1">{l.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActionTarget({ id: l._id, action: 'approve' })}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    title="Approve"
                  >
                    <HiOutlineCheckCircle className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActionTarget({ id: l._id, action: 'reject' })}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Reject"
                  >
                    <HiOutlineXCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {(!leaves || leaves.length === 0) && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              No pending leave requests
            </div>
          )}
        </motion.div>
      )}

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

export default LeaveApprovalPage;
