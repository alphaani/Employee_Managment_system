import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding,
  HiOutlineTrendingUp, HiOutlineDownload,
} from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import AttendanceAnalytics from '../../components/analytics/AttendanceAnalytics';
import PayrollAnalytics from '../../components/analytics/PayrollAnalytics';
import DepartmentAnalytics from '../../components/analytics/DepartmentAnalytics';
import PerformanceAnalytics from '../../components/analytics/PerformanceAnalytics';

const tabs = [
  { id: 'attendance', label: 'Attendance', icon: HiOutlineClock },
  { id: 'payroll', label: 'Payroll', icon: HiOutlineCurrencyDollar },
  { id: 'departments', label: 'Departments', icon: HiOutlineOfficeBuilding },
  { id: 'performance', label: 'Performance', icon: HiOutlineTrendingUp },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('attendance');

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance': return <AttendanceAnalytics />;
      case 'payroll': return <PayrollAnalytics />;
      case 'departments': return <DepartmentAnalytics />;
      case 'performance': return <PerformanceAnalytics />;
      default: return null;
    }
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Data-driven insights for your organization" />

      <div className="mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
