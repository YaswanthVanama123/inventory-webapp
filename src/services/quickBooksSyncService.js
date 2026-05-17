import api from './api';

const quickBooksSyncService = {
  async getStats() {
    const response = await api.get('/qb-sync/stats');
    return response;
  },
  async listQueue(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    const qs = queryParams.toString();
    const response = await api.get(`/qb-sync/queue${qs ? `?${qs}` : ''}`);
    return response;
  },
  async retry(id) {
    const response = await api.post(`/qb-sync/retry/${id}`);
    return response;
  },
  async triggerSnapshot() {
    const response = await api.post('/qb-sync/trigger-snapshot');
    return response;
  }
};

export default quickBooksSyncService;
