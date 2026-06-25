import api from './api';

export const performanceService = {
  getAll: (params) => api.get('/performance', { params }),
  getById: (id) => api.get(`/performance/${id}`),
  getMyEvaluations: (params) => api.get('/performance/my', { params }),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
};
