import api from './api';

export const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get stored user data
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }
};
