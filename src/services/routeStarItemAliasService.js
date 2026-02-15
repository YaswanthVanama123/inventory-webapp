import api from './api';





const routeStarItemAliasService = {
  


  getAllMappings: async () => {
    try {
      const response = await api.get('/routestar-item-alias/mappings');
      return response.data || { mappings: [], total: 0 };
    } catch (error) {
      console.error('getAllMappings error:', error);
      return { mappings: [], total: 0 };
    }
  },

  


  getUniqueItems: async () => {
    try {
      const response = await api.get('/routestar-item-alias/unique-items');
      return response.data || { items: [], stats: { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 } };
    } catch (error) {
      console.error('getUniqueItems error:', error);
      return { items: [], stats: { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 } };
    }
  },

  







  saveMapping: async (data) => {
    const response = await api.post('/routestar-item-alias/mapping', data);
    return response.data.data;
  },

  




  updateMapping: async (id, data) => {
    const response = await api.put(`/routestar-item-alias/mapping/${id}`, data);
    return response.data.data;
  },

  





  addAlias: async (id, aliasName, notes = null) => {
    const response = await api.post(`/routestar-item-alias/mapping/${id}/add-alias`, {
      aliasName,
      notes
    });
    return response.data.data;
  },

  




  removeAlias: async (id, aliasName) => {
    const response = await api.delete(`/routestar-item-alias/mapping/${id}/alias/${encodeURIComponent(aliasName)}`);
    return response.data.data;
  },

  



  deleteMapping: async (id) => {
    const response = await api.delete(`/routestar-item-alias/mapping/${id}`);
    return response.data.data;
  },

  


  getLookupMap: async () => {
    const response = await api.get('/routestar-item-alias/lookup-map');
    return response.data.data;
  },

  


  getSuggestedMappings: async () => {
    const response = await api.get('/routestar-item-alias/suggested-mappings');
    return response.data.data;
  },

  


  getStats: async () => {
    try {
      const response = await api.get('/routestar-item-alias/stats');
      return response.data || { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 };
    } catch (error) {
      console.error('getStats error:', error);
      return { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 };
    }
  }
};

export default routeStarItemAliasService;
