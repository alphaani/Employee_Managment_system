import api from './api';

export const attendanceService = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  getAll: (params) => api.get('/attendance', { params }),
  markAttendance: (data) => api.post('/attendance/mark', data),
  getDailyReport: (params) => api.get('/attendance/reports/daily', { params }),
  getMonthlyReport: (params) => api.get('/attendance/reports/monthly', { params }),
};
