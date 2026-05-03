import api from './api';

export const caregiverService = {
  getDashboard: (id) => api.get(`/caregivers/${id}/dashboard`),
  addTask: (id, task) => api.post(`/caregivers/${id}/tasks`, task),
  updateTaskStatus: (id, taskId, status) => api.put(`/caregivers/${id}/tasks/${taskId}`, { status }),
};

