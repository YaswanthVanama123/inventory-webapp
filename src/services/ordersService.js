import api from './api';

/**
 * Orders Service
 * Handles API calls for CustomerConnect orders
 */

/**
 * Get all orders with filters and pagination
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get('/customerconnect/orders', { params });
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get a specific order by order number
 */
export const getOrderByNumber = async (orderNumber) => {
  try {
    const response = await api.get(`/customerconnect/orders/${orderNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (params = {}) => {
  try {
    const response = await api.get('/customerconnect/stats', { params });
    return response;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

/**
 * Get order range (highest and lowest order numbers)
 */
export const getOrderRange = async () => {
  try {
    const response = await api.get('/customerconnect/order-range');
    return response;
  } catch (error) {
    console.error('Error fetching order range:', error);
    throw error;
  }
};

/**
 * Sync orders from CustomerConnect portal
 */
export const syncOrders = async (limit = 100, direction = 'new') => {
  try {
    const response = await api.post('/customerconnect/sync/orders',
      { limit, direction },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing orders:', error);
    throw error;
  }
};

/**
 * Sync order details for a specific order
 */
export const syncOrderDetails = async (orderNumber) => {
  try {
    const response = await api.post(`/customerconnect/sync/details/${orderNumber}`,
      {},
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing order details:', error);
    throw error;
  }
};

/**
 * Sync all order details
 */
export const syncAllOrderDetails = async (limit = 50) => {
  try {
    const response = await api.post('/customerconnect/sync/all-details',
      { limit },
      {
        timeout: 0, // No timeout - allow as long as needed
        retry: false // Disable automatic retries
      }
    );
    return response;
  } catch (error) {
    console.error('Error syncing all order details:', error);
    throw error;
  }
};

/**
 * Process stock movements for orders
 */
export const processStockMovements = async () => {
  try {
    const response = await api.post('/customerconnect/sync/stock',
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
 * Full sync (orders + details + stock)
 */
export const fullSync = async (options = {}) => {
  try {
    const response = await api.post('/customerconnect/sync/full',
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
 * Delete all orders
 */
export const deleteAllOrders = async () => {
  try {
    const response = await api.delete('/customerconnect/orders/all');
    return response;
  } catch (error) {
    console.error('Error deleting all orders:', error);
    throw error;
  }
};

/**
 * Delete orders by order numbers
 */
export const deleteBulkOrdersByNumbers = async (orderNumbers) => {
  try {
    const response = await api.post('/customerconnect/orders/bulk-delete-by-numbers', {
      orderNumbers
    });
    return response;
  } catch (error) {
    console.error('Error deleting orders by numbers:', error);
    throw error;
  }
};

export default {
  getOrders,
  getOrderByNumber,
  getOrderStats,
  getOrderRange,
  syncOrders,
  syncOrderDetails,
  syncAllOrderDetails,
  processStockMovements,
  fullSync,
  deleteAllOrders,
  deleteBulkOrdersByNumbers,
};
