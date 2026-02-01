import api from './api';

/**
 * Report Service
 * Handles all reporting and analytics API calls
 * All endpoints require Admin role
 */

const reportService = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Response with dashboard summary and statistics
   */
  dashboard: async () => {
    try {
      const response = await api.get('/reports/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get stock summary report
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.format - Response format: 'json', 'csv', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with stock summary or file download
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
      throw error;
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
      throw error;
    }
  },

  /**
   * Get reorder list
   * @param {Object} params - Query parameters
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with items needing reorder
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
      throw error;
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
   */
  auditLogs: async (params = {}) => {
    try {
      const response = await api.get('/reports/audit-logs', { params });
      return response;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  /**
   * Get inventory valuation report
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.valuationType - Valuation type: 'purchase', 'selling', 'profit'
   * @param {string} params.format - Response format: 'json', 'pdf', 'excel' (default: 'json')
   * @returns {Promise} Response with valuation data
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
      throw error;
    }
  },

  /**
   * Export data in various formats
   * @param {string} reportType - Type of report to export
   * @param {Object} params - Export parameters
   * @param {string} params.format - Format: 'csv', 'pdf', 'excel'
   * @returns {Promise} File download
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
      throw error;
    }
  },

  /**
   * Get category-wise stock distribution
   * @returns {Promise} Response with stock distribution by category
   */
  stockByCategory: async () => {
    try {
      const response = await api.get('/reports/stock-by-category');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get top items by value
   * @param {number} limit - Number of top items (default: 10)
   * @returns {Promise} Response with top items
   */
  topItems: async (limit = 10) => {
    try {
      const response = await api.get('/reports/top-items', {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent activity/changes
   * @param {number} limit - Number of recent changes (default: 20)
   * @returns {Promise} Response with recent changes
   */
  recentActivity: async (limit = 20) => {
    try {
      const response = await api.get('/reports/recent-activity', {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default reportService;
