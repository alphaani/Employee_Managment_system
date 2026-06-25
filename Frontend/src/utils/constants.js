export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

export const LEAVE_TYPES = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const PAYROLL_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  PENDING: 'pending',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const GENDER = ['Male', 'Female', 'Other'];

export const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'HiOutlineChartBar', roles: ['admin', 'employee'] },
  { label: 'Employees', path: '/employees', icon: 'HiOutlineUsers', roles: ['admin'] },
  { label: 'Departments', path: '/departments', icon: 'HiOutlineOfficeBuilding', roles: ['admin'] },
  { label: 'Attendance', path: '/attendance', icon: 'HiOutlineClock', roles: ['admin', 'employee'] },
  { label: 'Leave', path: '/leaves', icon: 'HiOutlineCalendar', roles: ['admin', 'employee'] },
  { label: 'Payroll', path: '/payroll', icon: 'HiOutlineCurrencyDollar', roles: ['admin', 'employee'] },
  { label: 'Performance', path: '/performance', icon: 'HiOutlineTrendingUp', roles: ['admin', 'employee'] },
  { label: 'Reports', path: '/reports', icon: 'HiOutlineDocumentReport', roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: 'HiOutlineCog', roles: ['admin'] },
  { label: 'Profile', path: '/profile', icon: 'HiOutlineUser', roles: ['admin', 'employee'] },
];
