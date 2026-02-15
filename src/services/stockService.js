import api from './api';

/**
 * Stock Service
 * Handles API calls for stock summary data
 */
const stockService = {
  /**
   * Get Use Stock summary (purchases from orders)
   */
  getUseStock: async () => {
    const response = await api.get('/stock/use');
    return response.data;
  },

  /**
   * Get Sell Stock summary (sales from invoices)
   */
  getSellStock: async () => {
    const response = await api.get('/stock/sell');
    return response.data;
  },

  /**
   * Get both Use and Sell stock summary
   */
  getStockSummary: async () => {
    const response = await api.get('/stock/summary');
    return response.data;
  },

  /**
   * Get SKUs and purchase history for a specific category
   */
  getCategorySKUs: async (categoryName) => {
    const response = await api.get(`/stock/category/${encodeURIComponent(categoryName)}/skus`);
    return response.data;
  },

  /**
   * Get SKUs and sales history for a specific category
   */
  getCategorySales: async (categoryName) => {
    const response = await api.get(`/stock/category/${encodeURIComponent(categoryName)}/sales`);
    return response.data;
  }
};

export default stockService;
