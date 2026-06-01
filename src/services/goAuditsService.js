import api from './api';

const goAuditsService = {
  getLocations: async () => {
    const response = await api.get('/goaudits/locations');
    return response;
  },

  getSyncStatus: async () => {
    const response = await api.get('/goaudits/sync-status');
    return response;
  },

  syncClosedInvoiceCustomers: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    console.log('🔄 Syncing customers to GoAudits with date range:', params);
    const response = await api.post('/goaudits/sync-closed-invoice-customers', {}, { params });
    console.log('✓ Sync completed:', response.data);
    return response;
  },

  syncSingleCustomer: async (customerId) => {
    const response = await api.post(`/goaudits/sync-customer/${customerId}`);
    return response;
  },

  removeSyncMapping: async (customerId) => {
    const response = await api.delete(`/goaudits/sync-mapping/${customerId}`);
    return response;
  },

  testAuthentication: async () => {
    const response = await api.get('/goaudits/test-auth');
    return response;
  }
};

export default goAuditsService;
