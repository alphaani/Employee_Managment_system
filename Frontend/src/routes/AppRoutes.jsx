import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RootLayout from '../components/layout/RootLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import EmployeeDashboardPage from '../pages/employee/EmployeeDashboardPage';
import EmployeeListPage from '../pages/employees/EmployeeListPage';
import EmployeeDetailPage from '../pages/employees/EmployeeDetailPage';
import EmployeeFormPage from '../pages/employees/EmployeeFormPage';
import DepartmentListPage from '../pages/departments/DepartmentListPage';
import DepartmentDetailPage from '../pages/departments/DepartmentDetailPage';
import DepartmentFormPage from '../pages/departments/DepartmentFormPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import AdminAttendancePage from '../pages/attendance/AdminAttendancePage';
import AttendanceReportPage from '../pages/attendance/AttendanceReportPage';
import PayrollListPage from '../pages/payroll/PayrollListPage';
import AdminPayrollListPage from '../pages/payroll/AdminPayrollListPage';
import PayrollDetailPage from '../pages/payroll/PayrollDetailPage';
import PayrollFormPage from '../pages/payroll/PayrollFormPage';
import LeaveListPage from '../pages/leave/LeaveListPage';
import AdminLeaveListPage from '../pages/leave/AdminLeaveListPage';
import LeaveRequestPage from '../pages/leave/LeaveRequestPage';
import LeaveApprovalPage from '../pages/leave/LeaveApprovalPage';
import PerformanceListPage from '../pages/performance/PerformanceListPage';
import AdminPerformanceListPage from '../pages/performance/AdminPerformanceListPage';
import PerformanceFormPage from '../pages/performance/PerformanceFormPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ReportsPage from '../pages/reports/ReportsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

const DashboardSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  return isAdmin ? <DashboardPage /> : <EmployeeDashboardPage />;
};

const AttendanceSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  return isAdmin ? <AdminAttendancePage /> : <AttendancePage />;
};

const LeaveSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  return isAdmin ? <AdminLeaveListPage /> : <LeaveListPage />;
};

const PayrollSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  return isAdmin ? <AdminPayrollListPage /> : <PayrollListPage />;
};

const PerformanceSwitch = () => {
  const { isAdmin } = useContext(AuthContext);
  return isAdmin ? <AdminPerformanceListPage /> : <PerformanceListPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute roles={['admin', 'employee']} />}>
        <Route element={<RootLayout />}>
          <Route path="/dashboard" element={<DashboardSwitch />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/new" element={<EmployeeFormPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            <Route path="/departments" element={<DepartmentListPage />} />
            <Route path="/departments/new" element={<DepartmentFormPage />} />
            <Route path="/departments/:id" element={<DepartmentDetailPage />} />
            <Route path="/departments/:id/edit" element={<DepartmentFormPage />} />
            <Route path="/payroll/new" element={<PayrollFormPage />} />
            <Route path="/attendance/report" element={<AttendanceReportPage />} />
            <Route path="/leaves/approvals" element={<LeaveApprovalPage />} />
            <Route path="/performance/new" element={<PerformanceFormPage />} />
            <Route path="/performance/:id/edit" element={<PerformanceFormPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['employee']} />}>
            <Route path="/leaves/new" element={<LeaveRequestPage />} />
          </Route>

          <Route path="/attendance" element={<AttendanceSwitch />} />
          <Route path="/leaves" element={<LeaveSwitch />} />
          <Route path="/payroll" element={<PayrollSwitch />} />
          <Route path="/payroll/:id" element={<PayrollDetailPage />} />
          <Route path="/performance" element={<PerformanceSwitch />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
