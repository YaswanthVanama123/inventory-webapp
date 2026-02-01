import api from './api';

/**
 * User Service
 * Handles all user management API calls
 * All endpoints require Admin role
 */

const userService = {
  /**
   * Get all users with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.role - Filter by role: 'admin', 'employee'
   * @param {boolean} params.isActive - Filter by active status
   * @returns {Promise} Response with users and pagination
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} Response with user details
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.username - Username (3-50 characters, alphanumeric and underscores)
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password (min 8 chars, uppercase, lowercase, number, special char)
   * @param {string} userData.fullName - Full name (2-100 characters)
   * @param {string} userData.role - Role: 'admin' or 'employee'
   * @returns {Promise} Response with created user
   */
  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @param {string} userData.email - Email address
   * @param {string} userData.fullName - Full name
   * @param {boolean} userData.isActive - Active status
   * @returns {Promise} Response with updated user
   * @note Cannot update username, password, or role through this endpoint
   */
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user (soft delete - marks as inactive)
   * @param {string} id - User ID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset user password
   * @param {string} id - User ID
   * @param {string} newPassword - New temporary password
   * @returns {Promise} Response confirming password reset
   */
  resetPassword: async (id, newPassword) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`, {
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get users by role
   * @param {string} role - Role to filter: 'admin' or 'employee'
   * @returns {Promise} Response with filtered users
   */
  getByRole: async (role) => {
    try {
      const response = await api.get('/users', {
        params: { role },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active users
   * @returns {Promise} Response with active users
   */
  getActive: async () => {
    try {
      const response = await api.get('/users', {
        params: { isActive: true },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inactive users
   * @returns {Promise} Response with inactive users
   */
  getInactive: async () => {
    try {
      const response = await api.get('/users', {
        params: { isActive: false },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
