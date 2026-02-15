import api from './api';





const routeStarItemsService = {
  


  getItems: async (params = {}) => {
    const response = await api.get('/routestar-items', { params });
    
    return response.data;
  },

  


  updateItemFlags: async (itemId, flags) => {
    const response = await api.patch(`/routestar-items/${itemId}/flags`, flags);
    return response.data;
  },

  


  getStats: async () => {
    const response = await api.get('/routestar-items/stats');
    return response.data;
  },

  


  deleteAllItems: async () => {
    const response = await api.delete('/routestar-items/all');
    return response.data;
  },

  


  syncItems: async () => {
    const response = await api.post('/routestar-items/sync');
    return response.data;
  },

  


  getSalesReport: async () => {
    const response = await api.get('/routestar-items/sales-report');
    return response.data;
  }
};

export default routeStarItemsService;
