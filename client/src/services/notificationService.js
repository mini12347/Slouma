import api from './api';

export const notificationService = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read`),
  createNotification: (data) => api.post(`/notifications`, data),
};
