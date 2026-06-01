import api from './api';

const screenPermissionService = {
  getAllScreens: async () => {
    const response = await api.get('/screen-permissions/screens');
    return response;
  },

  getScreenById: async (screenId) => {
    const response = await api.get(`/screen-permissions/screens/${screenId}`);
    return response;
  },

  createScreen: async (screenData) => {
    const response = await api.post('/screen-permissions/screens', screenData);
    return response;
  },

  updateScreen: async (screenId, screenData) => {
    const response = await api.put(`/screen-permissions/screens/${screenId}`, screenData);
    return response;
  },

  deleteScreen: async (screenId) => {
    const response = await api.delete(`/screen-permissions/screens/${screenId}`);
    return response;
  },

  getDefaultScreens: async () => {
    const response = await api.get('/screen-permissions/screens/default');
    return response;
  },

  updateDefaultScreens: async (screenIds) => {
    const response = await api.put('/screen-permissions/screens/default', { screenIds });
    return response;
  },

  initializeScreens: async () => {
    const response = await api.post('/screen-permissions/screens/initialize');
    return response;
  },

  getMyScreens: async () => {
    const response = await api.get('/screen-permissions/my-screens');
    return response;
  },

  getAllUsersWithPermissions: async () => {
    const response = await api.get('/screen-permissions/users');
    return response;
  },

  getUserScreens: async (userId) => {
    const response = await api.get(`/screen-permissions/users/${userId}/screens`);
    return response;
  },

  getUserSpecificPermissions: async (userId) => {
    const response = await api.get(`/screen-permissions/users/${userId}/permissions`);
    return response;
  },

  updateUserPermissions: async (userId, screenIds) => {
    const response = await api.put(`/screen-permissions/users/${userId}/permissions`, { screenIds });
    return response;
  }
};

export default screenPermissionService;
