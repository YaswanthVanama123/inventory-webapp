import api from './api';


export const getOrderById = async (orderIdOrNumber) => {
  try {
    const response = await api.get(`/customerconnect/orders/${orderIdOrNumber}`);
    return response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};
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
