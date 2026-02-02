import api from './api';
import { handleApiError } from './errorHandler';



const userService = {
  
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
