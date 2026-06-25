import api from './api';

export const payrollService = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  getMyPayroll: (params) => api.get('/payroll/my', { params }),
  generate: (data) => api.post('/payroll', data),
  updateStatus: (id, status) => api.patch(`/payroll/${id}/status`, { status }),
  getSalaryReport: () => api.get('/payroll/reports/salary'),
  getMonthlyReport: (params) => api.get('/payroll/reports/monthly', { params }),
};
