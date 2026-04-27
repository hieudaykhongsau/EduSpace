import api from '../utils/axiosConfig';

const messengerService = {
  getUserBoxChats: async () => {
    const response = await api.get('/api/chat/box');
    return response.data;
  },

  getOrCreateOneToOneChat: async (peerId) => {
    const response = await api.post(`/api/chat/box/1on1/${peerId}`);
    return response.data;
  },

  createGroupChat: async (chatName, memberIds) => {
    const response = await api.post('/api/chat/box/group', { chatName, memberIds });
    return response.data;
  },

  getChatHistory: async (boxId) => {
    const response = await api.get(`/api/chat/box/${boxId}/messages`);
    return response.data;
  },

  sendMessage: async (boxId, content, type = 'TEXT') => {
    const response = await api.post(`/api/chat/box/${boxId}/messages`, { content, type });
    return response.data;
  },

  searchUsers: async (keyword) => {
    const response = await api.get('/api/chat/users/search', { params: { keyword } });
    return response.data;
  }
};

export default messengerService;
