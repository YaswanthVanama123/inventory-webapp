import api from './api';

const orderDiscrepancyService = {
  // Get all order discrepancies with filters
  getOrderDiscrepancies: async (params = {}) => {
    const response = await api.get('/order-discrepancies', { params });
    return response;
  },

  // Get single order discrepancy
  getOrderDiscrepancyById: async (id) => {
    const response = await api.get(`/order-discrepancies/${id}`);
    return response;
  },

  // Get order discrepancies by order ID
  getOrderDiscrepanciesByOrderId: async (orderId) => {
    const response = await api.get(`/order-discrepancies/by-order/${orderId}`);
    return response;
  },

  // Verify order (mark as all good or record discrepancies)
  verifyOrder: async (orderId, data) => {
    const response = await api.post(`/order-discrepancies/verify/${orderId}`, data);
    return response;
  },

  // Approve order discrepancy
  approveOrderDiscrepancy: async (id, notes) => {
    const response = await api.post(`/order-discrepancies/${id}/approve`, { notes });
    return response;
  },

  // Reject order discrepancy
  rejectOrderDiscrepancy: async (id, notes) => {
    const response = await api.post(`/order-discrepancies/${id}/reject`, { notes });
    return response;
  },

  // Get order discrepancy statistics
  getOrderDiscrepancyStats: async () => {
    const response = await api.get('/order-discrepancies/stats');
    return response;
  }
};

export default orderDiscrepancyService;
