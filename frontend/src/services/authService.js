import api from '../utils/axiosConfig';

const authService = {
  login: async (emailOrUsername, password) => {
    const response = await api.post('/api/auth/login', { emailOrUsername, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  checkEmail: async (email) => {
    const response = await api.get('/api/auth/check-email', { params: { email } });
    return response.data.exists;
  },

  checkUsername: async (username) => {
    const response = await api.get('/api/auth/check-username', { params: { username } });
    return response.data.exists;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};


export default authService;
