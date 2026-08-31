import api from './api';

/**
 * Permanent data purge (admin only).
 *
 * Every call here HARD-deletes production records — there is no trash and no
 * undo. The `purgeAll*` calls require the literal confirm phrase, which the
 * backend re-checks, so a mistyped request can't wipe a collection.
 */
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

  /** Permanently delete specific records of one type. */
  async purgeSelected(type, ids) {
    try {
      return await api.post(`/data-purge/${type}/purge`, { ids });
    } catch (error) {
      throw new Error(error.message || 'Failed to delete selected records');
    }
  },

  /** Permanently delete every record of one type. */
  async purgeAll(type) {
    try {
      return await api.post(`/data-purge/${type}/purge-all`, {
        confirm: PURGE_CONFIRM_PHRASE,
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to delete all records');
    }
  },

  /** Permanently delete every record across several types in one pass. */
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
