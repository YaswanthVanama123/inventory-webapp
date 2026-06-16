import api from './api';

const longRunning = { timeout: 0, retry: false };

const log = (msg, error) => {
  console.error(msg, error);
  throw error;
};

export const getOrders = async (params = {}) => {
  try {
    return await api.get('/customerconnect/orders', { params });
  } catch (error) {
    log('Error fetching orders:', error);
  }
};

export const getOrderByNumber = async (orderNumber) => {
  try {
    return await api.get(`/customerconnect/orders/${orderNumber}`);
  } catch (error) {
    log('Error fetching order:', error);
  }
};

export const getOrderStats = async (params = {}) => {
  try {
    return await api.get('/customerconnect/stats', { params });
  } catch (error) {
    log('Error fetching order stats:', error);
  }
};

export const getOrderRange = async () => {
  try {
    return await api.get('/customerconnect/order-range');
  } catch (error) {
    log('Error fetching order range:', error);
  }
};

export const syncOrders = async (limit = 100, direction = 'new') => {
  try {
    return await api.post('/customerconnect/sync/orders', { limit, direction }, longRunning);
  } catch (error) {
    log('Error syncing orders:', error);
  }
};

export const syncOrderDetails = async (orderNumber) => {
  try {
    return await api.post(`/customerconnect/sync/details/${orderNumber}`, {}, longRunning);
  } catch (error) {
    log('Error syncing order details:', error);
  }
};

export const syncAllOrderDetails = async (limit = 50) => {
  try {
    return await api.post('/customerconnect/sync/all-details', { limit }, longRunning);
  } catch (error) {
    log('Error syncing all order details:', error);
  }
};

export const processStockMovements = async () => {
  try {
    return await api.post('/customerconnect/sync/stock', {}, longRunning);
  } catch (error) {
    log('Error processing stock movements:', error);
  }
};

export const fullSync = async (options = {}) => {
  try {
    return await api.post('/customerconnect/sync/full', options, longRunning);
  } catch (error) {
    log('Error performing full sync:', error);
  }
};

export const deleteAllOrders = async () => {
  try {
    return await api.delete('/customerconnect/orders/all');
  } catch (error) {
    log('Error deleting all orders:', error);
  }
};

export const deleteBulkOrdersByNumbers = async (orderNumbers) => {
  try {
    return await api.post('/customerconnect/orders/bulk-delete-by-numbers', { orderNumbers });
  } catch (error) {
    log('Error deleting orders by numbers:', error);
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
