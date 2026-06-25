import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineOfficeBuilding } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/helpers';

const DepartmentDetailPage = () => {
  const { id } = useParams();
  const { data: dept, loading } = useFetch(`/departments/${id}`);

  if (loading) return <div className="p-12"><Spinner /></div>;
  if (!dept) return <div className="p-12 text-center text-gray-500">Department not found</div>;

  const employees = dept.employees || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={dept.departmentName}
        subtitle={dept.description || 'Department details'}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to={`/departments/${id}/edit`}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Department
            </Link>
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-xl bg-primary-50 mb-3">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{dept.departmentName}</h3>
            {dept.manager && (
              <p className="text-sm text-gray-500 mt-1">Manager: {dept.manager}</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Employees</span>
                <span className="font-semibold text-gray-900">{employees.length}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Employees</h3>
            <p className="text-sm text-gray-500 mt-0.5">{employees.length} active employees</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Position</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Salary</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp, i) => (
                  <motion.tr
                    key={emp._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link to={`/employees/${emp._id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                          {emp.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                          {emp.fullName || 'Unknown'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.position || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.email || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.salary ? formatCurrency(emp.salary) : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status || 'active'} /></td>
                  </motion.tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-500">No employees in this department</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DepartmentDetailPage;
