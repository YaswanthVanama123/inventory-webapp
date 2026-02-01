import api, { setAuthToken } from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Response with token and user data
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      // Store token and user data in localStorage
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout current user
   * @returns {Promise} Response confirming logout
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');

      // Clear token and user data from localStorage
      setAuthToken(null);
      localStorage.removeItem('user');

      return response;
    } catch (error) {
      // Even if API call fails, clear local data
      setAuthToken(null);
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Get current authenticated user's information
   * @returns {Promise} Response with user data
   */
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');

      // Update user data in localStorage
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change the authenticated user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Response confirming password change
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Check if current user has admin role
   * @returns {boolean} True if user is admin
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  /**
   * Check if current user has employee role
   * @returns {boolean} True if user is employee
   */
  isEmployee: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'employee';
  },
};

export default authService;
