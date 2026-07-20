import api from './api';

export const userService = {
  updateProfile: async (id, data) => {
    const response = await api.put(`/auth/profile/${id}`, data);
    return response;
  },

  changePassword: async (id, data) => {
    const response = await api.put(`/auth/change-password/${id}`, data);
    return response;
  },

  changeEmail: async (id, data) => {
    const response = await api.put(`/auth/change-email/${id}`, data);
    return response;
  }
};

