import api from './api';

export const vendorService = {
  async getAllVendors() {
    try {
      const response = await api.get('/vendors');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch vendors');
    }
  },

  async getActiveVendors() {
    try {
      const response = await api.get('/vendors/active');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active vendors');
    }
  },

  async getVendorById(id) {
    try {
      const response = await api.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch vendor');
    }
  },

  async createVendor(data) {
    try {
      const response = await api.post('/vendors', data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create vendor');
    }
  },

  async updateVendor(id, data) {
    try {
      const response = await api.put(`/vendors/${id}`, data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update vendor');
    }
  },

  async deleteVendor(id) {
    try {
      const response = await api.delete(`/vendors/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete vendor');
    }
  }
};

export default vendorService;
