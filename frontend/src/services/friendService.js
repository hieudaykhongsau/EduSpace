import api from '../utils/axiosConfig';

const friendService = {
  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/api/friends/pending');
    return response.data;
  },

  sendRequest: async (addresseeId) => {
    const response = await api.post(`/api/friends/request/${addresseeId}`);
    return response.data;
  },

  acceptRequest: async (requesterId) => {
    const response = await api.post(`/api/friends/accept/${requesterId}`);
    return response.data;
  },

  declineRequest: async (requesterId) => {
    const response = await api.post(`/api/friends/decline/${requesterId}`);
    return response.data;
  },

  unfriend: async (friendId) => {
    const response = await api.delete(`/api/friends/unfriend/${friendId}`);
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/api/friends/sent');
    return response.data;
  },

  cancelRequest: async (addresseeId) => {
    const response = await api.post(`/api/friends/decline/${addresseeId}`);
    return response.data;
  }
};

export default friendService;
