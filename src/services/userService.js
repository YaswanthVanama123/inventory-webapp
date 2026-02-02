import api from './api';
import { handleApiError } from './errorHandler';

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
   * @throws {Object} Formatted error with user-friendly message
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view users.',
        network: 'Unable to load users. Please check your connection.',
      });
    }
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} Response with user details
   * @throws {Object} Formatted error with user-friendly message
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'User not found. They may have been deleted.',
        permission: 'You need administrator privileges to view user details.',
      });
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
   * @throws {Object} Formatted error with user-friendly message
   */
  create: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        validation: 'Please check all required fields and try again.',
        conflict: 'A user with this username or email already exists.',
        permission: 'You need administrator privileges to create users.',
      });
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
   * @throws {Object} Formatted error with user-friendly message
   * @note Cannot update username, password, or role through this endpoint
   */
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'User not found. They may have been deleted.',
        validation: 'Please check the user information and try again.',
        conflict: 'This email is already in use by another user.',
        permission: 'You need administrator privileges to update users.',
      });
    }
  },

  /**
   * Delete user (soft delete - marks as inactive)
   * @param {string} id - User ID
   * @returns {Promise} Response confirming deletion
   * @throws {Object} Formatted error with user-friendly message
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'User not found. They may have already been deleted.',
        permission: 'You need administrator privileges to delete users.',
        conflict: 'This user cannot be deleted at this time.',
      });
    }
  },

  /**
   * Reset user password
   * @param {string} id - User ID
   * @param {string} newPassword - New temporary password
   * @returns {Promise} Response confirming password reset
   * @throws {Object} Formatted error with user-friendly message
   */
  resetPassword: async (id, newPassword) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`, {
        newPassword,
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'User not found.',
        validation: 'The password does not meet security requirements.',
        permission: 'You need administrator privileges to reset passwords.',
      });
    }
  },

  /**
   * Get users by role
   * @param {string} role - Role to filter: 'admin' or 'employee'
   * @returns {Promise} Response with filtered users
   * @throws {Object} Formatted error with user-friendly message
   */
  getByRole: async (role) => {
    try {
      const response = await api.get('/users', {
        params: { role },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view users.',
      });
    }
  },

  /**
   * Get active users
   * @returns {Promise} Response with active users
   * @throws {Object} Formatted error with user-friendly message
   */
  getActive: async () => {
    try {
      const response = await api.get('/users', {
        params: { isActive: true },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view users.',
      });
    }
  },

  /**
   * Get inactive users
   * @returns {Promise} Response with inactive users
   * @throws {Object} Formatted error with user-friendly message
   */
  getInactive: async () => {
    try {
      const response = await api.get('/users', {
        params: { isActive: false },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view users.',
      });
    }
  },
};

export default userService;
