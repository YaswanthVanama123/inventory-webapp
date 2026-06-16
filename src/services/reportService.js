import api from './api';
import { downloadReport, downloadExport } from './_download';
import { wrap } from './_factory';

const adminMessages = { permission: 'You need administrator privileges to view reports.' };

const reportService = {
  dashboard: wrap(() => api.get('/reports/dashboard'), {
    permission: 'You need administrator privileges to view dashboard statistics.',
    network: 'Unable to load dashboard data. Please check your connection.',
  }),

  stockSummary: (params = {}) =>
    downloadReport('/reports/stock-summary', params, 'stock_summary', {
      permission: 'You need administrator privileges to view reports.',
      server: 'Failed to generate report. Please try again.',
    }),

  profitMargin: (params = {}) =>
    downloadReport('/reports/profit-margin', params, 'profit_margin', {
      permission: 'You need administrator privileges to view reports.',
      server: 'Failed to generate report. Please try again.',
    }),

  reorderList: (params = {}) =>
    downloadReport('/reports/reorder-list', params, 'reorder_list', adminMessages),

  auditLogs: wrap((params = {}) => api.get('/reports/audit-logs', { params }), {
    permission: 'You need administrator privileges to view audit logs.',
  }),

  sales: (params = {}) =>
    downloadReport('/reports/sales', params, 'sales_report', adminMessages),

  valuation: (params = {}) =>
    downloadReport('/reports/valuation', params, 'valuation_report', adminMessages),

  export: (reportType, params = {}) =>
    downloadExport(`/reports/${reportType}/export`, params, reportType, {
      permission: 'You need administrator privileges to export reports.',
      server: 'Failed to export data. Please try again.',
    }),

  stockByCategory: wrap(() => api.get('/reports/stock-by-category'), adminMessages),

  topItems: wrap((limit = 10) => api.get('/reports/top-items', { params: { limit } }), adminMessages),

  recentActivity: wrap((limit = 20) => api.get('/reports/recent-activity', { params: { limit } }), {
    permission: 'You need administrator privileges to view activity logs.',
  }),
};

export default reportService;
