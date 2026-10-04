import api from './api';

export const PURGE_CONFIRM_PHRASE = 'DELETE';

export const dataPurgeService = {
  async getTypes() {
    try {
      const response = await api.get('/data-purge/types');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to load data types');
    }
  },

  async purgeSelected(type, ids) {
    try {
      return await api.post(`/data-purge/${type}/purge`, { ids });
    } catch (error) {
      throw new Error(error.message || 'Failed to delete selected records');
    }
  },

  async purgeAll(type) {
    try {
      return await api.post(`/data-purge/${type}/purge-all`, {
        confirm: PURGE_CONFIRM_PHRASE,
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to delete all records');
    }
  },

  async purgeManyTypes(types) {
    try {
      return await api.post('/data-purge/purge-many', {
        types,
        confirm: PURGE_CONFIRM_PHRASE,
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to purge selected data types');
    }
  },
};

export default dataPurgeService;
