import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, formatCurrency } from '../../utils/helpers';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const { data: emp, loading } = useFetch(`/employees/${id}`);

  if (loading) return <div className="p-12"><Spinner /></div>;
  if (!emp) return <div className="p-12 text-center text-gray-500">Employee not found</div>;

  return (
    <div>
      <PageHeader
        title={emp.fullName}
        subtitle="Employee details"
        actions={
          <div className="flex gap-2">
            <Link
              to={`/employees/${id}/edit`}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </Link>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">
                {emp.fullName?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{emp.fullName}</h2>
            <p className="text-sm text-gray-500">{emp.position}</p>
            <div className="mt-3"><StatusBadge status={emp.status} /></div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <HiOutlineMail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{emp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlinePhone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{emp.phoneNumber || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium text-gray-900">{emp.departmentId?.departmentName || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="text-sm font-medium text-gray-900">{emp.position || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salary</p>
                <p className="text-sm font-medium text-gray-900">{emp.salary ? formatCurrency(emp.salary) : '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm text-gray-900">{formatDate(emp.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeDetailPage;
