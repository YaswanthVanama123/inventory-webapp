import api from './api';

/**
 * RouteStarItemAlias Service
 * Handles API calls for RouteStar item name alias management
 */
const routeStarItemAliasService = {
  /**
   * Get all mappings
   */
  getAllMappings: async () => {
    try {
      const response = await api.get('/routestar-item-alias/mappings');
      return response.data || { mappings: [], total: 0 };
    } catch (error) {
      console.error('getAllMappings error:', error);
      return { mappings: [], total: 0 };
    }
  },

  /**
   * Get all unique items from invoices with statistics
   */
  getUniqueItems: async () => {
    try {
      const response = await api.get('/routestar-item-alias/unique-items');
      return response.data || { items: [], stats: { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 } };
    } catch (error) {
      console.error('getUniqueItems error:', error);
      return { items: [], stats: { totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 } };
    }
  },

  /**
   * Create or update a mapping
   * @param {Object} data - Mapping data
   * @param {string} data.canonicalName - The canonical/master name
   * @param {Array<string|Object>} data.aliases - Array of alias names or objects with {name, notes}
   * @param {string} data.description - Optional description
   * @param {boolean} data.autoMerge - Whether to auto-merge in reports
   */
  saveMapping: async (data) => {
    const response = await api.post('/routestar-item-alias/mapping', data);
    return response.data.data;
  },

  /**
   * Update an existing mapping
   * @param {string} id - Mapping ID
   * @param {Object} data - Updated mapping data
   */
  updateMapping: async (id, data) => {
    const response = await api.put(`/routestar-item-alias/mapping/${id}`, data);
    return response.data.data;
  },

  /**
   * Add an alias to an existing mapping
   * @param {string} id - Mapping ID
   * @param {string} aliasName - Alias name to add
   * @param {string} notes - Optional notes
   */
  addAlias: async (id, aliasName, notes = null) => {
    const response = await api.post(`/routestar-item-alias/mapping/${id}/add-alias`, {
      aliasName,
      notes
    });
    return response.data.data;
  },

  /**
   * Remove an alias from a mapping
   * @param {string} id - Mapping ID
   * @param {string} aliasName - Alias name to remove
   */
  removeAlias: async (id, aliasName) => {
    const response = await api.delete(`/routestar-item-alias/mapping/${id}/alias/${encodeURIComponent(aliasName)}`);
    return response.data.data;
  },

  /**
   * Delete a mapping
   * @param {string} id - Mapping ID
   */
  deleteMapping: async (id) => {
    const response = await api.delete(`/routestar-item-alias/mapping/${id}`);
    return response.data.data;
  },

  /**
   * Get alias -> canonical name lookup map
   */
  getLookupMap: async () => {
    const response = await api.get('/routestar-item-alias/lookup-map');
    return response.data.data;
  },

  /**
   * Get suggested mappings based on similar item names
   */
  getSuggestedMappings: async () => {
    const response = await api.get('/routestar-item-alias/suggested-mappings');
    return response.data.data;
  },

  /**
   * Get statistics about mappings
   */
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
