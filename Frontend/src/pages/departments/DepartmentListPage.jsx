import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineOfficeBuilding, HiOutlineUsers } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useFetch';

const DepartmentListPage = () => {
  const { data: departments, loading } = useFetch('/departments');

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments?.length || 0} departments`}
        actions={
          <Link
            to="/departments/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Department
          </Link>
        }
      />

      {loading ? (
        <div className="p-12"><Spinner /></div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {departments?.map((dept, i) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-primary-50">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <Link to={`/departments/${dept._id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">{dept.departmentName}</Link>
                  {dept.manager && <p className="text-xs text-gray-500">Manager: {dept.manager}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <HiOutlineUsers className="w-4 h-4" />
                <span>{dept.employeeCount || dept.employees?.length || 0} employees</span>
              </div>
              {dept.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{dept.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                <Link
                  to={`/departments/${dept._id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details
                </Link>
                <Link
                  to={`/departments/${dept._id}/edit`}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Edit
                </Link>
              </div>
            </motion.div>
          ))}
          {(!departments || departments.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No departments found
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DepartmentListPage;
