import api from '../utils/axiosConfig';

const communityService = {
  createPost: async (content, mediaUrl) => {
    const response = await api.post('/api/community/post', { content, mediaUrl });
    return response.data;
  },

  getFeed: async () => {
    const response = await api.get('/api/community/feed');
    return response.data;
  },

  toggleLike: async (postId) => {
    const response = await api.post(`/api/community/post/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, content) => {
    const response = await api.post(`/api/community/post/${postId}/comment`, { content });
    return response.data;
  },

  getComments: async (postId) => {
    const response = await api.get(`/api/community/post/${postId}/comments`);
    return response.data;
  }
};

export default communityService;
