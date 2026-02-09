import api from './api';

/**
 * RouteStar Service
 * Handles API calls for RouteStar invoices (sales)
 */

/**
 * Get all invoices with filters and pagination
 */
export const getInvoices = async (params = {}) => {
  try {
    const response = await api.get('/routestar/invoices', { params });
    return response;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Get a specific invoice by invoice number
 */
export const getInvoiceByNumber = async (invoiceNumber) => {
  try {
    const response = await api.get(`/routestar/invoices/${invoiceNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async (params = {}) => {
  try {
    const response = await api.get('/routestar/stats', { params });
    return response;
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    throw error;
  }
};

/**
 * Get invoice range (highest and lowest invoice numbers)
 */
export const getInvoiceRange = async (invoiceType = null) => {
  try {
    const params = invoiceType ? { invoiceType } : {};
    const response = await api.get('/routestar/invoice-range', { params });
    return response;
  } catch (error) {
    console.error('Error fetching invoice range:', error);
    throw error;
  }
};

/**
 * Sync pending invoices from RouteStar portal
 */
export const syncPendingInvoices = async (limit = 0, direction = 'new') => {
  try {
    const response = await api.post('/routestar/sync/pending',
      { limit, direction },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing pending invoices:', error);
    throw error;
  }
};

/**
 * Sync closed invoices from RouteStar portal
 */
export const syncClosedInvoices = async (limit = 0, direction = 'new') => {
  try {
    const response = await api.post('/routestar/sync/closed',
      { limit, direction },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing closed invoices:', error);
    throw error;
  }
};

/**
 * Sync invoice details for a specific invoice
 */
export const syncInvoiceDetails = async (invoiceNumber) => {
  try {
    const response = await api.post(`/routestar/sync/details/${invoiceNumber}`,
      {},
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing invoice details:', error);
    throw error;
  }
};

/**
 * Sync pending invoices with details (keeps browser open)
 */
export const syncPendingInvoicesWithDetails = async (limit = 0, direction = 'new') => {
  try {
    const response = await api.post('/routestar/sync/pending-with-details',
      { limit, direction },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing pending invoices with details:', error);
    throw error;
  }
};

/**
 * Sync closed invoices with details (keeps browser open)
 */
export const syncClosedInvoicesWithDetails = async (limit = 0, direction = 'new') => {
  try {
    const response = await api.post('/routestar/sync/closed-with-details',
      { limit, direction },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing closed invoices with details:', error);
    throw error;
  }
};

/**
 * Sync all invoice details (for invoices without line items)
 */
export const syncAllInvoiceDetails = async (limit = 0) => {
  try {
    const response = await api.post('/routestar/sync/all-details',
      { limit },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing all invoice details:', error);
    throw error;
  }
};

/**
 * Process stock movements for invoices
 */
export const processStockMovements = async () => {
  try {
    const response = await api.post('/routestar/sync/stock',
      {},
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error processing stock movements:', error);
    throw error;
  }
};

/**
 * Full sync (pending + closed + stock)
 */
export const fullSync = async (options = {}) => {
  try {
    const response = await api.post('/routestar/sync/full',
      options,
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error performing full sync:', error);
    throw error;
  }
};

/**
 * Delete all pending invoices
 */
export const deleteAllPendingInvoices = async () => {
  try {
    const response = await api.delete('/routestar/invoices/pending/all');
    return response;
  } catch (error) {
    console.error('Error deleting pending invoices:', error);
    throw error;
  }
};

/**
 * Delete all closed invoices
 */
export const deleteAllClosedInvoices = async () => {
  try {
    const response = await api.delete('/routestar/invoices/closed/all');
    return response;
  } catch (error) {
    console.error('Error deleting closed invoices:', error);
    throw error;
  }
};

export default {
  getInvoices,
  getInvoiceByNumber,
  getInvoiceStats,
  getInvoiceRange,
  syncPendingInvoices,
  syncClosedInvoices,
  syncInvoiceDetails,
  processStockMovements,
  fullSync,
  deleteAllPendingInvoices,
  deleteAllClosedInvoices,
};
