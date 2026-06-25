import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineStar, HiOutlinePlus, HiOutlineSearch,
  HiOutlineTrendingUp, HiOutlineUserGroup, HiOutlineBadgeCheck,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import StatCard from '../../components/ui/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';

const AdminPerformanceListPage = () => {
  const [search, setSearch] = useState('');
  const { data: evaluations, loading } = useFetch('/performance');

  const totalEvals = evaluations?.length || 0;
  const avgRating = evaluations?.length
    ? (evaluations.reduce((sum, e) => sum + (e.rating || 0), 0) / evaluations.length).toFixed(1)
    : '—';

  const highCount = evaluations?.filter((e) => (e.rating || 0) >= 4).length || 0;

  const filtered = evaluations?.filter((e) =>
    !search || e.employeeId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        subtitle="Review and manage employee evaluations"
        actions={
          <Link
            to="/performance/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Evaluation
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        <StatCard title="Total Evaluations" value={totalEvals} icon={HiOutlineUserGroup} color="primary" variant="gradient" subtitle="All time reviews" />
        <StatCard title="Average Rating" value={avgRating} icon={HiOutlineTrendingUp} color="purple" variant="gradient" subtitle="Out of 5.0" />
        <StatCard title="High Performers" value={highCount} icon={HiOutlineBadgeCheck} color="green" variant="gradient" subtitle="Rating ≥ 4.0" />
      </motion.div>

      {loading ? (
        <div className="p-12"><Spinner /></div>
      ) : (
        <>
          <div className="relative max-w-xs">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered?.map((ev, i) => (
              <motion.div
                key={ev._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {ev.employeeId?.fullName?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ev.employeeId?.fullName}</p>
                    <p className="text-xs text-gray-500">{formatDate(ev.evaluationDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiOutlineStar
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(ev.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                  <span className="text-sm font-bold text-gray-900 ml-1">{ev.rating || 'N/A'}</span>
                </div>

                {ev.feedback && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{ev.feedback}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{formatDate(ev.createdAt)}</span>
                  <Link
                    to={`/performance/${ev._id}/edit`}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Edit
                  </Link>
                </div>
              </motion.div>
            ))}
            {(!filtered || filtered.length === 0) && (
              <div className="col-span-full text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrendingUp className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No evaluations found</p>
                <Link to="/performance/new" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
                  Create the first evaluation
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminPerformanceListPage;
