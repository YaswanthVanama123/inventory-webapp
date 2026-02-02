import api from './api';
import { handleApiError } from './errorHandler';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

const dashboardService = {
  /**
   * Get dashboard statistics and data
   * @returns {Promise} Response with dashboard data
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get recent activity logs
   * @param {number} limit - Number of activities to fetch (default: 20)
   * @returns {Promise} Response with recent activities
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get low stock items
   * @returns {Promise} Response with low stock items
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get stock summary
   * @returns {Promise} Response with stock summary
   * @throws {Object} Formatted error with user-friendly message
   */
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
