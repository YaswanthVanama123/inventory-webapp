import api from './api';

const truckCheckoutService = {
  // Create new checkout
  createCheckout: async (checkoutData) => {
    const response = await api.post('/truck-checkouts', checkoutData);
    return response;
  },

  // Get all checkouts with filtering
  getCheckouts: async (params = {}) => {
    const response = await api.get('/truck-checkouts', { params });
    return response;
  },

  // Get active checkouts
  getActiveCheckouts: async () => {
    const response = await api.get('/truck-checkouts/active');
    return response;
  },

  // Get checkouts by employee
  getEmployeeCheckouts: async (employeeName, limit = 50) => {
    const response = await api.get(`/truck-checkouts/employee/${employeeName}`, {
      params: { limit }
    });
    return response;
  },

  // Get employee stats
  getEmployeeStats: async (employeeName, startDate = null, endDate = null) => {
    const response = await api.get(`/truck-checkouts/stats/employee/${employeeName}`, {
      params: { startDate, endDate }
    });
    return response;
  },

  // Get single checkout
  getCheckout: async (id) => {
    const response = await api.get(`/truck-checkouts/${id}`);
    return response;
  },

  // Complete checkout with invoice numbers
  completeCheckout: async (id, invoiceNumbers, invoiceType = 'closed') => {
    const response = await api.post(`/truck-checkouts/${id}/complete`, {
      invoiceNumbers,
      invoiceType
    });
    return response;
  },

  // Fetch invoices and tally results
  tallyCheckout: async (id) => {
    const response = await api.post(`/truck-checkouts/${id}/tally`);
    return response;
  },

  // Process stock movements
  processStock: async (id) => {
    const response = await api.post(`/truck-checkouts/${id}/process-stock`);
    return response;
  },

  // Cancel checkout
  cancelCheckout: async (id, reason) => {
    const response = await api.post(`/truck-checkouts/${id}/cancel`, { reason });
    return response;
  },

  // Update checkout
  updateCheckout: async (id, updates) => {
    const response = await api.patch(`/truck-checkouts/${id}`, updates);
    return response;
  },

  // Delete checkout
  deleteCheckout: async (id) => {
    const response = await api.delete(`/truck-checkouts/${id}`);
    return response;
  }
};

export default truckCheckoutService;
