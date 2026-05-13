import api from './api';

const orderDiscrepancyService = {
  
  getOrderDiscrepancies: async (params = {}) => {
    const response = await api.get('/order-discrepancies', { params });
    return response;
  },
  getOrderDiscrepancyById: async (id) => {
    const response = await api.get(`/order-discrepancies/${id}`);
    return response;
  },
  getOrderDiscrepanciesByOrderId: async (orderId) => {
    const response = await api.get(`/order-discrepancies/by-order/${orderId}`);
    return response;
  },
  verifyOrder: async (orderId, data) => {
    const response = await api.post(`/order-discrepancies/verify/${orderId}`, data);
    return response;
  },
  approveOrderDiscrepancy: async (id, notes) => {
    const response = await api.post(`/order-discrepancies/${id}/approve`, { notes });
    return response;
  },
  rejectOrderDiscrepancy: async (id, notes) => {
    const response = await api.post(`/order-discrepancies/${id}/reject`, { notes });
    return response;
  },
  getOrderDiscrepancyStats: async () => {
    const response = await api.get('/order-discrepancies/stats');
    return response;
  },
  deleteOrderDiscrepancy: async (id) => {
    const response = await api.delete(`/order-discrepancies/${id}`);
    return response;
  }
};
export default orderDiscrepancyService;
