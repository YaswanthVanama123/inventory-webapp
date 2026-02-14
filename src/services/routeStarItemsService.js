import api from './api';

/**
 * RouteStarItems Service
 * Handles API calls for RouteStarItems management
 */
const routeStarItemsService = {
  /**
   * Get all items with optional filters and pagination
   */
  getItems: async (params = {}) => {
    const response = await api.get('/routestar-items', { params });
    // api interceptor already extracts response.data, so response IS the data
    return response.data;
  },

  /**
   * Update forUse and forSell flags for an item
   */
  updateItemFlags: async (itemId, flags) => {
    const response = await api.patch(`/routestar-items/${itemId}/flags`, flags);
    return response.data;
  },

  /**
   * Get statistics about items
   */
  getStats: async () => {
    const response = await api.get('/routestar-items/stats');
    return response.data;
  },

  /**
   * Delete all items
   */
  deleteAllItems: async () => {
    const response = await api.delete('/routestar-items/all');
    return response.data;
  },

  /**
   * Trigger sync from RouteStar
   */
  syncItems: async () => {
    const response = await api.post('/routestar-items/sync');
    return response.data;
  }
};

export default routeStarItemsService;
