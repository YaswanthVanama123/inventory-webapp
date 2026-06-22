import api from './api';


const stockService = {
  getUseStock: async () => {
    const response = await api.get('/stock/use');
    return response.data;
  },
  getSellStock: async () => {
    const response = await api.get('/stock/sell');
    return response.data;
  },
  getStockSummary: async () => {
    const response = await api.get('/stock/summary');
    return response.data;
  },
  getCategorySKUs: async (categoryName) => {
    const response = await api.get(`/stock/category/${encodeURIComponent(categoryName)}/skus`);
    return response.data;
  },
  getCategorySales: async (categoryName) => {
    const response = await api.get(`/stock/category/${encodeURIComponent(categoryName)}/sales`);
    return response.data;
  },
  // Fuzzy + partial search across category names, aliases / order item names,
  // SKUs and item names. Returns { query, total, matches: [{categoryName, ...}] }.
  searchStock: async (q) => {
    const response = await api.get('/stock/search', {params: {q}});
    return response.data;
  }
};
export default stockService;
