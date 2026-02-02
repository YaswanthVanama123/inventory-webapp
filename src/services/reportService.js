import api from './api';
import { handleApiError } from './errorHandler';

/**
 * Report Service
 * Handles all reporting and analytics API calls
 * All endpoints require Admin role
 */

const reportService = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Response with dashboard summary and statistics
   * @throws {Object} Formatted error with user-friendly message
   */
  dashboard: async () => {
    try {
      const response = await api.get('/reports/dashboard');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view dashboard statistics.',
        network: 'Unable to load dashboard data. Please check your connection.',
      });
    }
  },

  /**
   * Get stock summary report
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.format - Response format: 'json', 'csv', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with stock summary or file download
   * @throws {Object} Formatted error with user-friendly message
   */
  stockSummary: async (params = {}) => {
    try {
      // If format is not json, we need to handle file download
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/stock-summary', {
          params,
          responseType: 'blob',
        });

        // Trigger browser download
        const contentType = response.type;
        const url = window.URL.createObjectURL(new Blob([response], { type: contentType }));
        const link = document.createElement('a');
        link.href = url;

        // Determine file extension
        const extension = params.format === 'csv' ? 'csv' :
                         params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `stock_summary_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      // JSON format
      const response = await api.get('/reports/stock-summary', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
        server: 'Failed to generate report. Please try again.',
      });
    }
  },

  /**
   * Get profit margin report
   * @param {Object} params - Query parameters
   * @param {number} params.minMargin - Filter items with minimum profit margin percentage
   * @param {number} params.maxMargin - Filter items with maximum profit margin percentage
   * @param {string} params.sortBy - Sort by: 'margin', 'revenue', 'profit' (default: 'margin')
   * @param {string} params.order - Sort order: 'asc', 'desc' (default: 'desc')
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with profit margin analysis
   * @throws {Object} Formatted error with user-friendly message
   */
  profitMargin: async (params = {}) => {
    try {
      // If format is not json, handle file download
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/profit-margin', {
          params,
          responseType: 'blob',
        });

        // Trigger browser download
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;

        const extension = params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `profit_margin_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      // JSON format
      const response = await api.get('/reports/profit-margin', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
        server: 'Failed to generate report. Please try again.',
      });
    }
  },

  /**
   * Get reorder list
   * @param {Object} params - Query parameters
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with items needing reorder
   * @throws {Object} Formatted error with user-friendly message
   */
  reorderList: async (params = {}) => {
    try {
      // If format is not json, handle file download
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/reorder-list', {
          params,
          responseType: 'blob',
        });

        // Trigger browser download
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;

        const extension = params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `reorder_list_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      // JSON format
      const response = await api.get('/reports/reorder-list', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  /**
   * Get audit logs
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 50)
   * @param {string} params.action - Filter by action: 'CREATE', 'UPDATE', 'DELETE'
   * @param {string} params.resource - Filter by resource: 'USER', 'INVENTORY'
   * @param {string} params.userId - Filter by user ID
   * @param {string} params.startDate - Filter from date (ISO 8601)
   * @param {string} params.endDate - Filter to date (ISO 8601)
   * @returns {Promise} Response with audit logs and pagination
   * @throws {Object} Formatted error with user-friendly message
   */
  auditLogs: async (params = {}) => {
    try {
      const response = await api.get('/reports/audit-logs', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view audit logs.',
      });
    }
  },

  /**
   * Get sales report
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (ISO 8601)
   * @param {string} params.endDate - End date (ISO 8601)
   * @param {string} params.category - Filter by category
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with sales data
   * @throws {Object} Formatted error with user-friendly message
   */
  sales: async (params = {}) => {
    try {
      // If format is not json, handle file download
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/sales', {
          params,
          responseType: 'blob',
        });

        // Trigger browser download
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;

        const extension = params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      // JSON format
      const response = await api.get('/reports/sales', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  /**
   * Get inventory valuation report
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.valuationType - Valuation type: 'purchase', 'selling', 'profit'
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with valuation data
   * @throws {Object} Formatted error with user-friendly message
   */
  valuation: async (params = {}) => {
    try {
      // If format is not json, handle file download
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/valuation', {
          params,
          responseType: 'blob',
        });

        // Trigger browser download
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;

        const extension = params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `valuation_report_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      // JSON format
      const response = await api.get('/reports/valuation', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  /**
   * Export data in various formats
   * @param {string} reportType - Type of report to export
   * @param {Object} params - Export parameters
   * @param {string} params.format - Format: 'csv', 'pdf', 'excel'
   * @returns {Promise} File download
   * @throws {Object} Formatted error with user-friendly message
   */
  export: async (reportType, params = {}) => {
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params,
        responseType: 'blob',
      });

      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;

      const extension = params.format === 'csv' ? 'csv' :
                       params.format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.${extension}`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to export reports.',
        server: 'Failed to export data. Please try again.',
      });
    }
  },

  /**
   * Get category-wise stock distribution
   * @returns {Promise} Response with stock distribution by category
   * @throws {Object} Formatted error with user-friendly message
   */
  stockByCategory: async () => {
    try {
      const response = await api.get('/reports/stock-by-category');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  /**
   * Get top items by value
   * @param {number} limit - Number of top items (default: 10)
   * @returns {Promise} Response with top items
   * @throws {Object} Formatted error with user-friendly message
   */
  topItems: async (limit = 10) => {
    try {
      const response = await api.get('/reports/top-items', {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  /**
   * Get recent activity/changes
   * @param {number} limit - Number of recent changes (default: 20)
   * @returns {Promise} Response with recent changes
   * @throws {Object} Formatted error with user-friendly message
   */
  recentActivity: async (limit = 20) => {
    try {
      const response = await api.get('/reports/recent-activity', {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view activity logs.',
      });
    }
  },
};

export default reportService;
