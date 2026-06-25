import api from './api';

export const leaveService = {
  getAll: (params) => api.get('/leaves', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  getMyLeaves: (params) => api.get('/leaves/my', { params }),
  submit: (data) => api.post('/leaves', data),
  approve: (id) => api.patch(`/leaves/${id}/approve`),
  reject: (id) => api.patch(`/leaves/${id}/reject`),
};
