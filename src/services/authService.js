import api, { setAuthToken, getErrorMessage, isErrorType } from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login admin user with username and password
   * @param {string} username - Admin's username
   * @param {string} password - Admin's password
   * @returns {Promise} Response with token and user data
   * @throws {Object} Formatted error with user-friendly message
   */
  loginAdmin: async (username, password) => {
    try {
      const response = await api.post('/auth/admin/login', {
        username,
        password,
      });

      // Store token and user data in localStorage
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'admin');
      }

      return response;
    } catch (error) {
      // Handle validation errors
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      // Handle authentication errors (401 or 403)
      if (error.status === 401 || error.status === 403) {
        throw {
          ...error,
          userMessage: error.message || 'Invalid admin credentials. Please try again.',
        };
      }

      // Handle network errors
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      // Throw formatted error
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  /**
   * Login employee user with username and password
   * @param {string} username - Employee's username
   * @param {string} password - Employee's password
   * @returns {Promise} Response with token and user data
   * @throws {Object} Formatted error with user-friendly message
   */
  loginEmployee: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      // Store token and user data in localStorage
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'employee');
      }

      return response;
    } catch (error) {
      // Handle validation errors
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      // Handle authentication errors (401 or 403)
      if (error.status === 401 || error.status === 403) {
        throw {
          ...error,
          userMessage: error.message || 'Invalid employee credentials. Please try again.',
        };
      }

      // Handle network errors
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      // Throw formatted error
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  /**
   * Generic login (backwards compatibility)
   * @deprecated Use loginAdmin or loginEmployee instead
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
      // Handle validation errors
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      // Handle authentication errors
      if (error.status === 401) {
        throw {
          ...error,
          userMessage: 'Invalid username or password. Please try again.',
        };
      }

      // Handle network errors
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      // Throw formatted error
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  /**
   * Logout current user
   * @returns {Promise} Response confirming logout
   * @throws {Object} Formatted error with user-friendly message
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');

      // Clear token and user data from localStorage
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');

      return response;
    } catch (error) {
      // Even if API call fails, clear local data
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');

      // Don't throw error for logout - always succeed locally
      console.error('Logout error:', getErrorMessage(error));
      return { success: true, message: 'Logged out successfully' };
    }
  },

  /**
   * Get current authenticated user's information
   * @returns {Promise} Response with user data
   * @throws {Object} Formatted error with user-friendly message
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
      // Handle authentication errors
      if (isErrorType(error, 'auth')) {
        throw {
          ...error,
          userMessage: 'Your session has expired. Please log in again.',
        };
      }

      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  /**
   * Change the authenticated user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Response confirming password change
   * @throws {Object} Formatted error with user-friendly message
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return response;
    } catch (error) {
      // Handle validation errors
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.validationErrors || 'Please check your password requirements.',
        };
      }

      // Handle authentication errors
      if (error.status === 401) {
        throw {
          ...error,
          userMessage: 'Current password is incorrect.',
        };
      }

      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
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
