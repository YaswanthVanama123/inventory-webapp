import api from './api';

export const itemCaseQuantityService = {
  async getPurchasedItems(params = {}) {
    try {
      const response = await api.get('/case-quantity/purchased-items', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch purchased items');
    }
  },

  async saveMapping(data) {
    try {
      return await api.post('/case-quantity/mapping', data);
    } catch (error) {
      throw new Error(error.message || 'Failed to save case quantity');
    }
  },

  async bulkSaveMappings(items) {
    try {
      return await api.post('/case-quantity/mappings/bulk', { items });
    } catch (error) {
      throw new Error(error.message || 'Failed to save case quantities');
    }
  },

  async deleteMapping(sku) {
    try {
      return await api.delete(`/case-quantity/mapping/${encodeURIComponent(sku)}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete case quantity');
    }
  },

  async getAllMappings(search) {
    try {
      const response = await api.get('/case-quantity/mappings', { params: { search } });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch case quantity mappings');
    }
  }
};

export default itemCaseQuantityService;
