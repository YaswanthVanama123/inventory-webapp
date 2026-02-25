import api from './api';
import { handleApiError } from './errorHandler';



const reportService = {
  
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

  
  stockSummary: async (params = {}) => {
    try {
      
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/stock-summary', {
          params,
          responseType: 'blob',
        });

        
        const contentType = response.type;
        const url = window.URL.createObjectURL(new Blob([response], { type: contentType }));
        const link = document.createElement('a');
        link.href = url;

        
        const extension = params.format === 'csv' ? 'csv' :
                         params.format === 'pdf' ? 'pdf' : 'xlsx';
        link.setAttribute('download', `stock_summary_${new Date().toISOString().split('T')[0]}.${extension}`);

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Report downloaded successfully' };
      }

      
      const response = await api.get('/reports/stock-summary', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
        server: 'Failed to generate report. Please try again.',
      });
    }
  },

  
  profitMargin: async (params = {}) => {
    try {
      
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/profit-margin', {
          params,
          responseType: 'blob',
        });

        
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

      
      const response = await api.get('/reports/profit-margin', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
        server: 'Failed to generate report. Please try again.',
      });
    }
  },

  
  reorderList: async (params = {}) => {
    try {
      
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/reorder-list', {
          params,
          responseType: 'blob',
        });

        
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

      
      const response = await api.get('/reports/reorder-list', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  
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

  
  sales: async (params = {}) => {
    try {
      
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/sales', {
          params,
          responseType: 'blob',
        });

        
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

      
      const response = await api.get('/reports/sales', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  
  valuation: async (params = {}) => {
    try {
      
      if (params.format && params.format !== 'json') {
        const response = await api.get('/reports/valuation', {
          params,
          responseType: 'blob',
        });

        
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

      
      const response = await api.get('/reports/valuation', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        permission: 'You need administrator privileges to view reports.',
      });
    }
  },

  
  export: async (reportType, params = {}) => {
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params,
        responseType: 'blob',
      });

      
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
