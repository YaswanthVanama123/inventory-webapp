import api from './api';
import { wrap } from './_factory';
import { triggerBlobDownload } from './_download';

const invoiceService = {
  getAll: wrap((params = {}) => api.get('/invoices', { params }), {
    network: 'Unable to load invoices. Please check your connection.',
  }),

  getById: wrap((id) => api.get(`/invoices/${id}`), {
    notfound: 'Invoice not found. It may have been deleted.',
  }),

  getByNumber: wrap((number) => api.get(`/invoices/number/${number}`), {
    notfound: 'Invoice not found with this invoice number.',
  }),

  create: wrap((invoiceData) => api.post('/invoices', invoiceData), {
    validation: 'Invalid invoice data. Please check all required fields.',
    notfound: 'Inventory item not found.',
    conflict: 'Insufficient stock for this invoice.',
  }),

  update: wrap((id, invoiceData) => api.put(`/invoices/${id}`, invoiceData), {
    notfound: 'Invoice not found. It may have been deleted.',
    validation: 'Invalid invoice data. Please check your input.',
  }),

  delete: wrap((id) => api.delete(`/invoices/${id}`), {
    notfound: 'Invoice not found. It may have already been deleted.',
    permission: 'You do not have permission to delete invoices.',
  }),

  getPDF: wrap(async (id, download = false) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
      params: { download },
    });
    if (download) {
      triggerBlobDownload(new Blob([response]), `invoice_${id}.pdf`);
    }
    return response;
  }, {
    notfound: 'Invoice not found.',
    server: 'Failed to generate PDF. Please try again.',
  }),

  sendEmail: wrap((id, emailData = {}) => api.post(`/invoices/${id}/send-email`, emailData), {
    notfound: 'Invoice not found.',
    validation: 'Invalid email address.',
    server: 'Failed to send email. Please try again.',
  }),

  getByType: wrap((type) => api.get('/invoices', { params: { type } })),

  getByDateRange: wrap((startDate, endDate) =>
    api.get('/invoices', { params: { startDate, endDate } })),

  getRecent: wrap((limit = 10) => api.get('/invoices', { params: { limit, page: 1 } })),

  preview: wrap((invoiceData) => api.post('/invoices/preview', invoiceData), {
    validation: 'Invalid invoice data for preview.',
    notfound: 'Inventory item not found.',
  }),
};

export default invoiceService;
