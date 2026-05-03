import api from './api';

export const publicService = {
  getStats: () => api.get('/public/stats'),
};
