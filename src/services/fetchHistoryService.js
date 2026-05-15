import api from './api';

const fetchHistoryService = {
  
  async getPageData(params = {}) {
    const { source, status, fetchType, limit = 50, page = 1, days, startDate, endDate } = params;
    const queryParams = new URLSearchParams();
    if (source) queryParams.append('source', source);
    if (status) queryParams.append('status', status);
    if (fetchType) queryParams.append('fetchType', fetchType);
    queryParams.append('limit', limit);
    queryParams.append('page', page);
    if (startDate && endDate) {
      queryParams.append('startDate', startDate);
      queryParams.append('endDate', endDate);
    } else if (days) {
      queryParams.append('days', days);
    }
    const response = await api.get(`/fetch-history/page-data?${queryParams.toString()}`);
    return response.data || response; 
  },
  async getHistory(params = {}) {
    const { source, status, fetchType, limit = 50, page = 1, days = 15 } = params;
    const queryParams = new URLSearchParams();
    if (source) queryParams.append('source', source);
    if (status) queryParams.append('status', status);
    if (fetchType) queryParams.append('fetchType', fetchType);
    queryParams.append('limit', limit);
    queryParams.append('page', page);
    queryParams.append('days', days);
    const response = await api.get(`/fetch-history?${queryParams.toString()}`);
    return response; 
  },
  async getActiveFetches(source = null) {
    const queryParams = source ? `?source=${source}` : '';
    const response = await api.get(`/fetch-history/active${queryParams}`);
    return response; 
  },
  async getStatistics(source = null, days = 15) {
    const queryParams = new URLSearchParams();
    if (source) queryParams.append('source', source);
    queryParams.append('days', days);
    const response = await api.get(`/fetch-history/statistics?${queryParams.toString()}`);
    return response; 
  },
  async getFetchDetails(id) {
    const response = await api.get(`/fetch-history/${id}`);
    return response; 
  },
  async cancelFetch(id) {
    const response = await api.post(`/fetch-history/${id}/cancel`);
    return response; 
  },
  async cleanupOldRecords(days = 15) {
    const response = await api.delete(`/fetch-history/cleanup?days=${days}`);
    return response; 
  }
};
export default fetchHistoryService;
