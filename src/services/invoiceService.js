import api from './api';

/**
 * Invoice Service
 * Handles all invoice-related API calls
 */

const invoiceService = {
  /**
   * Get all invoices with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.type - Filter by type: 'sale', 'purchase', 'stock_adjustment'
   * @param {string} params.startDate - Filter from date (ISO 8601)
   * @param {string} params.endDate - Filter to date (ISO 8601)
   * @param {string} params.customerName - Search by customer/supplier name
   * @returns {Promise} Response with invoices and pagination
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Promise} Response with invoice details
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice by number
   * @param {string} number - Invoice number (e.g., 'INV-2026-00123')
   * @returns {Promise} Response with invoice details
   */
  getByNumber: async (number) => {
    try {
      const response = await api.get(`/invoices/number/${number}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new invoice
   * @param {Object} invoiceData - Invoice data
   * @param {string} invoiceData.itemId - Inventory item ID
   * @param {string} invoiceData.type - Invoice type: 'sale', 'purchase', 'stock_adjustment'
   * @param {number} invoiceData.quantity - Quantity
   * @param {string} invoiceData.customerName - Customer/supplier name
   * @param {string} invoiceData.customerEmail - Customer/supplier email
   * @param {string} invoiceData.customerAddress - Customer/supplier address
   * @param {string} invoiceData.notes - Optional notes
   * @param {boolean} invoiceData.includeQRCode - Include QR code (default: true)
   * @returns {Promise} Response with created invoice
   */
  create: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} invoiceData - Updated invoice data
   * @returns {Promise} Response with updated invoice
   */
  update: async (id, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice PDF
   * @param {string} id - Invoice ID
   * @param {boolean} download - Whether to download the PDF (default: false)
   * @returns {Promise} PDF Blob or download
   */
  getPDF: async (id, download = false) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
        params: { download },
      });

      // If download is true, trigger browser download
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
      throw error;
    }
  },

  /**
   * Send invoice via email
   * @param {string} id - Invoice ID
   * @param {Object} emailData - Email data
   * @param {string} emailData.to - Recipient email address (optional, uses invoice customer email if not provided)
   * @param {string} emailData.subject - Email subject (optional)
   * @param {string} emailData.message - Additional message (optional)
   * @returns {Promise} Response confirming email sent
   */
  sendEmail: async (id, emailData = {}) => {
    try {
      const response = await api.post(`/invoices/${id}/send-email`, emailData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoices by type
   * @param {string} type - Invoice type: 'sale', 'purchase', 'stock_adjustment'
   * @returns {Promise} Response with filtered invoices
   */
  getByType: async (type) => {
    try {
      const response = await api.get('/invoices', {
        params: { type },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoices by date range
   * @param {string} startDate - Start date (ISO 8601 format)
   * @param {string} endDate - End date (ISO 8601 format)
   * @returns {Promise} Response with filtered invoices
   */
  getByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/invoices', {
        params: { startDate, endDate },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent invoices
   * @param {number} limit - Number of recent invoices (default: 10)
   * @returns {Promise} Response with recent invoices
   */
  getRecent: async (limit = 10) => {
    try {
      const response = await api.get('/invoices', {
        params: { limit, page: 1 },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Preview invoice (get invoice data without creating)
   * @param {Object} invoiceData - Invoice data for preview
   * @returns {Promise} Response with invoice preview
   */
  preview: async (invoiceData) => {
    try {
      const response = await api.post('/invoices/preview', invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default invoiceService;
