import { useContext } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineStar } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';
import { AuthContext } from '../../context/AuthContext';

const PerformanceListPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const endpoint = isAdmin ? '/performance' : '/performance/my';
  const { data: evaluations, loading } = useFetch(endpoint);

  return (
    <div>
      <PageHeader
        title="Performance"
        subtitle={isAdmin ? 'Employee performance evaluations' : 'Your performance reviews'}
      />

      {loading ? (
        <div className="p-12"><Spinner /></div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {evaluations?.map((ev, i) => (
            <motion.div
              key={ev._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {ev.employeeId?.fullName?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ev.employeeId?.fullName}</p>
                  <p className="text-xs text-gray-500">{formatDate(ev.evaluationDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <HiOutlineStar className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-gray-900">{ev.rating || 'N/A'}</span>
                <span className="text-xs text-gray-500">/ 5</span>
              </div>

              {ev.feedback && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ev.feedback}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">{formatDate(ev.createdAt)}</span>
              </div>
            </motion.div>
          ))}
          {(!evaluations || evaluations.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">No evaluations found</div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PerformanceListPage;
