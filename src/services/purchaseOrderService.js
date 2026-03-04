import api from './api';

/**
 * Get order by ID
 * @param {string} orderIdOrNumber - The order ID or order number
 * @returns {Promise} API response with order details
 */
export const getOrderById = async (orderIdOrNumber) => {
  try {
    // Try to get by order number from customerconnect
    const response = await api.get(`/customerconnect/orders/${orderIdOrNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

/**
 * Get order by order number
 * @param {string} orderNumber - The order number
 * @returns {Promise} API response with order details
 */
export const getOrderByNumber = async (orderNumber) => {
  try {
    const response = await api.get(`/customerconnect/orders/${orderNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    throw error;
  }
};

export default {
  getOrderById,
  getOrderByNumber,
};
