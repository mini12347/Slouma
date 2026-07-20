import api from './api';

export const settingsService = {
  getSettings: async (userId) => {
    return await api.get(`/settings/${userId}`);
  },

  updateSettings: async (userId, settingsData) => {
    return await api.put(`/settings/${userId}`, settingsData);
  },

  updateSettingsCategory: async (userId, category, categoryData) => {
    return await api.patch(`/settings/${userId}/${category}`, categoryData);
  },

  resetSettings: async (userId) => {
    return await api.post(`/settings/${userId}/reset`);
  },

  updateProfile: async (id, data) => {
    return await api.put(`/auth/profile/${id}`, data);
  },

  changePassword: async (id, data) => {
    return await api.put(`/auth/change-password/${id}`, data);
  }
};
