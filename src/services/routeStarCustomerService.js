import api from './api';

const routeStarCustomerService = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/routestar-customers', { params });
    return response.data;
  },

  getCustomerById: async (customerId) => {
    const response = await api.get(`/routestar-customers/${customerId}`);
    return response.data;
  },

  getCustomerStats: async () => {
    const response = await api.get('/routestar-customers/stats');
    return response.data;
  },

  deleteAllCustomers: async () => {
    const response = await api.delete('/routestar-customers/all');
    return response.data;
  },

  syncCustomers: async () => {
    const response = await api.post('/routestar-customers/sync');
    return response.data;
  },

  syncCustomerDetails: async (params = {}) => {
    const response = await api.post('/routestar-customers/sync-details', {}, { params });
    return response.data;
  }
};

export default routeStarCustomerService;
