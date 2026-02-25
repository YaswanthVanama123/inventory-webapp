import api from './api';

const fetchHistoryService = {
  // Get all fetch history with filters
  async getHistory(params = {}) {
    const { source, status, fetchType, limit = 50, page = 1, days = 10 } = params;

    const queryParams = new URLSearchParams();
    if (source) queryParams.append('source', source);
    if (status) queryParams.append('status', status);
    if (fetchType) queryParams.append('fetchType', fetchType);
    queryParams.append('limit', limit);
    queryParams.append('page', page);
    queryParams.append('days', days);

    const response = await api.get(`/fetch-history?${queryParams.toString()}`);
    return response; // Interceptor already returns response.data
  },

  // Get active/in-progress fetches
  async getActiveFetches(source = null) {
    const queryParams = source ? `?source=${source}` : '';
    const response = await api.get(`/fetch-history/active${queryParams}`);
    return response; // Interceptor already returns response.data
  },

  // Get statistics
  async getStatistics(source = null, days = 10) {
    const queryParams = new URLSearchParams();
    if (source) queryParams.append('source', source);
    queryParams.append('days', days);

    const response = await api.get(`/fetch-history/statistics?${queryParams.toString()}`);
    return response; // Interceptor already returns response.data
  },

  // Get single fetch details
  async getFetchDetails(id) {
    const response = await api.get(`/fetch-history/${id}`);
    return response; // Interceptor already returns response.data
  },

  // Cancel an in-progress fetch
  async cancelFetch(id) {
    const response = await api.post(`/fetch-history/${id}/cancel`);
    return response; // Interceptor already returns response.data
  },

  // Cleanup old records
  async cleanupOldRecords(days = 10) {
    const response = await api.delete(`/fetch-history/cleanup?days=${days}`);
    return response; // Interceptor already returns response.data
  }
};

export default fetchHistoryService;
