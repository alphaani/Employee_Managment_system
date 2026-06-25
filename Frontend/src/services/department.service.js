import api from './api';

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getStats: (id) => api.get(`/departments/${id}/stats`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  assignEmployees: (id, employeeIds) => api.post(`/departments/${id}/employees`, { employeeIds }),
};
