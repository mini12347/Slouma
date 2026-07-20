import api from './api';

export const adminService = {
  getDashboard: (id) =>
    api.get(`/admins/dashboard/${id}`),

  createUser: (userData, adminId) =>
    api.post('/admins/users', { role: userData.role, userData }, {
      headers: { 'x-admin-id': adminId }
    }),

  deleteUser: (role, id, adminId) =>
    api.delete(`/admins/users/${role}/${id}`, {
      headers: { 'x-admin-id': adminId }
    }),

  approveUser: (id, role, adminId, doctorID) =>
    api.post('/admins/approve', { id, role, doctorID }, {
      headers: { 'x-admin-id': adminId }
    }),

  updateUser: (role, id, userData, adminId) =>
    api.put(`/admins/users/${role}/${id}`, userData, {
      headers: { 'x-admin-id': adminId }
    }),

  generateReport: (adminId, title, content) =>
    api.post('/admins/reports', { adminId, title, content }),

  broadcastNotification: (targetRole, content, type) =>
    api.post('/admins/broadcast', { targetRole, content, type }),

  broadcastMessage: (adminId, targetRole, content) =>
    api.post('/admins/broadcast-message', { adminId, targetRole, content }),
  
  verifyPassword: (adminId, password) =>
    api.post('/admins/verify-password', { adminId, password }),
};