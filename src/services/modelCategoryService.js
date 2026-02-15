import api from './api';

export const modelCategoryService = {
  
  async getUniqueModels() {
    try {
      const response = await api.get('/model-category/unique-models');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch models');
    }
  },

  
  async getRouteStarItems() {
    try {
      const response = await api.get('/model-category/routestar-items');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch RouteStar items');
    }
  },

  
  async saveMapping(data) {
    try {
      const response = await api.post('/model-category/mapping', data);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save mapping');
    }
  },

  
  async deleteMapping(modelNumber) {
    try {
      const response = await api.delete(`/model-category/mapping/${modelNumber}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete mapping');
    }
  },

  
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
