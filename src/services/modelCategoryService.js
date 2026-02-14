import api from './api';

export const modelCategoryService = {
  // Get all unique model numbers from orders
  async getUniqueModels() {
    try {
      const response = await api.get('/model-category/unique-models');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch models');
    }
  },

  // Get all RouteStar items for dropdown
  async getRouteStarItems() {
    try {
      const response = await api.get('/model-category/routestar-items');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch RouteStar items');
    }
  },

  // Save/update mapping
  async saveMapping(data) {
    try {
      const response = await api.post('/model-category/mapping', data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save mapping');
    }
  },

  // Delete mapping
  async deleteMapping(modelNumber) {
    try {
      const response = await api.delete(`/model-category/mapping/${modelNumber}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete mapping');
    }
  },

  // Get all mappings
  async getAllMappings() {
    try {
      const response = await api.get('/model-category/mappings');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch mappings');
    }
  }
};

export default modelCategoryService;
