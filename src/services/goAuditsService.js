import api from './api';

const goAuditsService = {
  // Get all locations from GoAudits
  getLocations: async () => {
    const response = await api.get('/goaudits/locations');
    return response;
  },

  // Get sync status
  getSyncStatus: async () => {
    const response = await api.get('/goaudits/sync-status');
    return response;
  },

  // Sync customers from closed invoices to GoAudits
  syncClosedInvoiceCustomers: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    console.log('🔄 Syncing customers to GoAudits with date range:', params);
    const response = await api.post('/goaudits/sync-closed-invoice-customers', {}, { params });
    console.log('✓ Sync completed:', response.data);
    return response;
  },

  // Sync single customer to GoAudits
  syncSingleCustomer: async (customerId) => {
    const response = await api.post(`/goaudits/sync-customer/${customerId}`);
    return response;
  },

  // Remove sync mapping
  removeSyncMapping: async (customerId) => {
    const response = await api.delete(`/goaudits/sync-mapping/${customerId}`);
    return response;
  },

  // Test authentication
  testAuthentication: async () => {
    const response = await api.get('/goaudits/test-auth');
    return response;
  }
};

export default goAuditsService;
