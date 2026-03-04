import api from './api';
import { handleApiError } from './errorHandler';

const discrepancyService = {
  
  getDiscrepancies: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/discrepancies?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load discrepancies. Please check your connection.',
        server: 'Failed to load discrepancies. Please try again later.',
      });
    }
  },

  
  getSummary: async (startDate, endDate) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await api.get(`/discrepancies/summary?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load summary. Please check your connection.',
        server: 'Failed to load summary. Please try again later.',
      });
    }
  },

  
  createDiscrepancy: async (data) => {
    try {
      const response = await api.post('/discrepancies', data);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to create discrepancy. Please check your connection.',
        server: 'Failed to create discrepancy. Please try again later.',
      });
    }
  },

  
  updateDiscrepancy: async (id, data) => {
    try {
      const response = await api.put(`/discrepancies/${id}`, data);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to update discrepancy. Please check your connection.',
        server: 'Failed to update discrepancy. Please try again later.',
      });
    }
  },

  
  approveDiscrepancy: async (id, notes = '') => {
    try {
      const response = await api.post(`/discrepancies/${id}/approve`, { notes });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to approve discrepancy. Please check your connection.',
        server: 'Failed to approve discrepancy. Please try again later.',
      });
    }
  },

  
  rejectDiscrepancy: async (id, notes = '') => {
    try {
      const response = await api.post(`/discrepancies/${id}/reject`, { notes });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to reject discrepancy. Please check your connection.',
        server: 'Failed to reject discrepancy. Please try again later.',
      });
    }
  },

  
  bulkApproveDiscrepancies: async (discrepancyIds, notes = '') => {
    try {
      const response = await api.post('/discrepancies/bulk-approve', {
        discrepancyIds,
        notes
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to bulk approve. Please check your connection.',
        server: 'Failed to bulk approve. Please try again later.',
      });
    }
  },

  
  deleteDiscrepancy: async (id) => {
    try {
      const response = await api.delete(`/discrepancies/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to delete discrepancy. Please check your connection.',
        server: 'Failed to delete discrepancy. Please try again later.',
      });
    }
  },

  
  searchInvoices: async (searchTerm, limit = 10) => {
    try {
      const response = await api.get(`/routestar/invoices?search=${searchTerm}&limit=${limit}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to search invoices. Please check your connection.',
        server: 'Failed to search invoices. Please try again later.',
      });
    }
  },
};

export default discrepancyService;
