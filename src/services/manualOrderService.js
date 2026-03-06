import api from './api';

export const manualOrderService = {
  async getNextOrderNumber() {
    try {
      const response = await api.get('/manual-orders/next-number');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get next order number');
    }
  },

  async getAllManualOrders(params = {}) {
    try {
      const response = await api.get('/manual-orders', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch manual orders');
    }
  },

  async getManualOrderByNumber(orderNumber) {
    try {
      const response = await api.get(`/manual-orders/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch manual order');
    }
  },

  async createManualOrder(data) {
    try {
      const response = await api.post('/manual-orders', data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create manual order');
    }
  },

  async updateManualOrder(orderNumber, data) {
    try {
      const response = await api.put(`/manual-orders/${orderNumber}`, data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update manual order');
    }
  },

  async deleteManualOrder(orderNumber) {
    try {
      const response = await api.delete(`/manual-orders/${orderNumber}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete manual order');
    }
  }
};

export default manualOrderService;
