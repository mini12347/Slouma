import api from './api';

export const messagesService = {
  getContacts: (userId, role) => api.get(`/messages/${userId}/contacts?role=${role}`),
  getChatHistory: (userId, contactId) => api.get(`/messages/${userId}/history/${contactId}`),
  sendMessage: (payload) => api.post(`/messages`, payload)
};
