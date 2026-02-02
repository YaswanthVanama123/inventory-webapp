import api from './api';
import { handleApiError } from './errorHandler';



const dashboardService = {
  
  getDashboardData: async () => {
    try {
      const response = await api.get('/reports/dashboard');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load dashboard data. Please check your connection.',
        server: 'Failed to load dashboard. Please try again later.',
      });
    }
  },

  
  getRecentActivity: async (limit = 20) => {
    try {
      const response = await api.get('/reports/recent-activity', {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load recent activity. Please check your connection.',
      });
    }
  },

  
  getLowStockItems: async () => {
    try {
      const response = await api.get('/inventory', {
        params: { lowStock: 'true' },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load low stock items. Please check your connection.',
      });
    }
  },

  
  getStockSummary: async () => {
    try {
      const response = await api.get('/reports/stock-summary');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load stock summary. Please check your connection.',
      });
    }
  },
};

export default dashboardService;
