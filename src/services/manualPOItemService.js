import api from './api';

export const manualPOItemService = {
  async getAllItems() {
    try {
      const response = await api.get('/manual-po-items');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch manual PO items');
    }
  },

  async getActiveItems() {
    try {
      const response = await api.get('/manual-po-items/active');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active manual PO items');
    }
  },

  async getItemBySku(sku) {
    try {
      const response = await api.get(`/manual-po-items/${sku}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch manual PO item');
    }
  },

  async createItem(data) {
    try {
      const response = await api.post('/manual-po-items', data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create manual PO item');
    }
  },

  async updateItem(sku, data) {
    try {
      const response = await api.put(`/manual-po-items/${sku}`, data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update manual PO item');
    }
  },

  async deleteItem(sku) {
    try {
      const response = await api.delete(`/manual-po-items/${sku}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete manual PO item');
    }
  },

  async getRouteStarItems() {
    try {
      const response = await api.get('/manual-po-items/routestar-items');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch RouteStar items');
    }
  },

  async getPageData() {
    try {
      const response = await api.get('/manual-po-items/page-data');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch page data');
    }
  }
};

export default manualPOItemService;
