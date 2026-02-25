import api, { setAuthToken, getErrorMessage, isErrorType } from './api';



const authService = {
  
  loginAdmin: async (username, password) => {
    try {
      const response = await api.post('/auth/admin/login', {
        username,
        password,
      });

      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'admin');
      }

      return response;
    } catch (error) {
      
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      
      if (error.status === 401 || error.status === 403) {
        throw {
          ...error,
          userMessage: error.message || 'Invalid admin credentials. Please try again.',
        };
      }

      
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  
  loginEmployee: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'employee');
      }

      return response;
    } catch (error) {
      
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      
      if (error.status === 401 || error.status === 403) {
        throw {
          ...error,
          userMessage: error.message || 'Invalid employee credentials. Please try again.',
        };
      }

      
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.details || 'Please check your username and password.',
        };
      }

      
      if (error.status === 401) {
        throw {
          ...error,
          userMessage: 'Invalid username or password. Please try again.',
        };
      }

      
      if (isErrorType(error, 'network')) {
        throw {
          ...error,
          userMessage: 'Unable to connect to the server. Please check your internet connection.',
        };
      }

      
      throw {
        ...error,
        userMessage: getErrorMessage(error),
      };
    }
  },

  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');

      
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');

      return response;
    } catch (error) {
      
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');

      
      console.error('Logout error:', getErrorMessage(error));
      return { success: true, message: 'Logged out successfully' };
    }
  },

  
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');

      
      if (response.success && response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      
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

  
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return response;
    } catch (error) {
      
      if (isErrorType(error, 'validation')) {
        throw {
          ...error,
          userMessage: error.validationErrors || 'Please check your password requirements.',
        };
      }

      
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

  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  
  isEmployee: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'employee';
  },
};

export default authService;
