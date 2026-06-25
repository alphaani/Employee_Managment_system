import api from './api';

export const analyticsService = {
  getAttendanceAnalytics: (params) => api.get('/analytics/attendance', { params }),
  getPayrollAnalytics: (params) => api.get('/analytics/payroll', { params }),
  getDepartmentAnalytics: () => api.get('/analytics/departments'),
  getPerformanceAnalytics: () => api.get('/analytics/performance'),
};
