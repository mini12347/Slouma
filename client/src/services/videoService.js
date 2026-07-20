import api from './api';

export const videoService = {
  getVideos: async (role) => {
    const response = await api.get(`/videos?role=${role}`);
    return response;
  },
  
  createVideo: async (videoData) => {
    const response = await api.post('/videos', videoData);
    return response;
  },
  
  deleteVideo: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response;
  }
};
