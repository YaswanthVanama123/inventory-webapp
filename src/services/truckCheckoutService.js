import api from './api';

const truckCheckoutService = {
  
  searchItems: async (query = '', forSell = true, limit = 100) => {
    const response = await api.get('/truck-checkouts/items/search', {
      params: { q: query, forSell, limit }
    });
    return response;
  },

  
  getItemStock: async (itemName) => {
    const response = await api.get(`/truck-checkouts/stock/${encodeURIComponent(itemName)}`);
    return response;
  },

  
  createCheckoutNew: async (checkoutData) => {
    const response = await api.post('/truck-checkouts/create-new', checkoutData);
    return response;
  },

  
  createCheckout: async (checkoutData) => {
    const response = await api.post('/truck-checkouts', checkoutData);
    return response;
  },

  
  getCheckouts: async (params = {}) => {
    const response = await api.get('/truck-checkouts', { params });
    return response;
  },

  
  getActiveCheckouts: async () => {
    const response = await api.get('/truck-checkouts/active');
    return response;
  },

  
  getEmployeeCheckouts: async (employeeName, limit = 50) => {
    const response = await api.get(`/truck-checkouts/employee/${employeeName}`, {
      params: { limit }
    });
    return response;
  },

  
  getEmployeeStats: async (employeeName, startDate = null, endDate = null) => {
    const response = await api.get(`/truck-checkouts/stats/employee/${employeeName}`, {
      params: { startDate, endDate }
    });
    return response;
  },

  
  getCheckout: async (id) => {
    const response = await api.get(`/truck-checkouts/${id}`);
    return response;
  },

  
  completeCheckout: async (id, invoiceNumbers, invoiceType = 'closed') => {
    const response = await api.post(`/truck-checkouts/${id}/complete`, {
      invoiceNumbers,
      invoiceType
    });
    return response;
  },

  
  checkWork: async (id, invoiceNumbers, invoiceType = 'closed') => {
    const response = await api.post(`/truck-checkouts/${id}/check-work`, {
      invoiceNumbers,
      invoiceType
    });
    return response;
  },

  
  tallyCheckout: async (id) => {
    const response = await api.post(`/truck-checkouts/${id}/tally`);
    return response;
  },

  
  processStock: async (id) => {
    const response = await api.post(`/truck-checkouts/${id}/process-stock`);
    return response;
  },

  
  cancelCheckout: async (id, reason) => {
    const response = await api.post(`/truck-checkouts/${id}/cancel`, { reason });
    return response;
  },

  
  updateCheckout: async (id, updates) => {
    const response = await api.patch(`/truck-checkouts/${id}`, updates);
    return response;
  },

  
  deleteCheckout: async (id) => {
    const response = await api.delete(`/truck-checkouts/${id}`);
    return response;
  },

  
  getSalesTracking: async (params = {}) => {
    const response = await api.get('/truck-checkouts/sales-tracking', { params });
    return response;
  },

  getAllEmployeesWithStats: async (params = {}) => {
    const response = await api.get('/truck-checkouts/employees/stats', { params });
    return response;
  }
};

export default truckCheckoutService;
