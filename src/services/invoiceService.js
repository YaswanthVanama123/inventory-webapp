import api from './api';
import { handleApiError } from './errorHandler';



const invoiceService = {
  
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load invoices. Please check your connection.',
      });
    }
  },

  
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found. It may have been deleted.',
      });
    }
  },

  
  getByNumber: async (number) => {
    try {
      const response = await api.get(`/invoices/number/${number}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found with this invoice number.',
      });
    }
  },

  
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        validation: 'Invalid invoice data. Please check all required fields.',
        notfound: 'Inventory item not found.',
        conflict: 'Insufficient stock for this invoice.',
      });
    }
  },

  
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found. It may have been deleted.',
        validation: 'Invalid invoice data. Please check your input.',
      });
    }
  },

  
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found. It may have already been deleted.',
        permission: 'You do not have permission to delete invoices.',
      });
    }
  },

  
  getPDF: async (id, download = false) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
        params: { download },
      });

      
      if (download) {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found.',
        server: 'Failed to generate PDF. Please try again.',
      });
    }
  },

  
  sendEmail: async (id, emailData = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/send-email`, emailData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Invoice not found.',
        validation: 'Invalid email address.',
        server: 'Failed to send email. Please try again.',
      });
    }
  },

  
  getByType: async (type) => {
    try {
      const response = await api.get('/invoices', {
        params: { type },
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/invoices', {
        params: { startDate, endDate },
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  
  getRecent: async (limit = 10) => {
    try {
      const response = await api.get('/invoices', {
        params: { limit, page: 1 },
      });
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  
  preview: async (invoiceData) => {
    try {
      const response = await api.post('/invoices/preview', invoiceData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        validation: 'Invalid invoice data for preview.',
        notfound: 'Inventory item not found.',
      });
    }
  },
};

export default invoiceService;
