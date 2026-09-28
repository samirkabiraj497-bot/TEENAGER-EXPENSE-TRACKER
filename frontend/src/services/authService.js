import api from './api';

const authService = {
  async register({ name, email, password, confirmPassword }) {
    return api.post('/auth/register', { name, email, password, confirmPassword });
  },

  async login({ email, password }) {
    return api.post('/auth/login', { email, password });
  },

  async getMe() {
    return api.get('/auth/me');
  }
};

export default authService;
