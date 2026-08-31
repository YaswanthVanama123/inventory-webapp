import api from './api';

/**
 * Case Quantity (pack size) mappings.
 *
 * Purchase orders record quantities in purchase units - a "case". Stock,
 * sales and truck checkouts are counted in single selling units. These
 * mappings tell the backend how many selling units a case contains, so
 * buying 1 case of 200 adds 200 to stock while selling 1 removes 1.
 */
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
