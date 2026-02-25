import api from './api';
import { handleApiError } from './errorHandler';



const dashboardService = {
  
  getDashboardData: async () => {
    try {
      console.log('[DashboardService] Starting API call to /reports/dashboard');
      console.log('[DashboardService] Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api');

      const response = await api.get('/reports/dashboard');

      console.log('[DashboardService] API call successful, response:', response);
      return response;
    } catch (error) {
      console.error('[DashboardService] API call failed:', error);
      console.error('[DashboardService] Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response
      });
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
