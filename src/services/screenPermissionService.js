import api from './api';

const screenPermissionService = {
  // Get all screens
  getAllScreens: async () => {
    const response = await api.get('/screen-permissions/screens');
    return response;
  },

  // Get a single screen by ID
  getScreenById: async (screenId) => {
    const response = await api.get(`/screen-permissions/screens/${screenId}`);
    return response;
  },

  // Create a new screen
  createScreen: async (screenData) => {
    const response = await api.post('/screen-permissions/screens', screenData);
    return response;
  },

  // Update a screen
  updateScreen: async (screenId, screenData) => {
    const response = await api.put(`/screen-permissions/screens/${screenId}`, screenData);
    return response;
  },

  // Delete a screen
  deleteScreen: async (screenId) => {
    const response = await api.delete(`/screen-permissions/screens/${screenId}`);
    return response;
  },

  // Get default screens
  getDefaultScreens: async () => {
    const response = await api.get('/screen-permissions/screens/default');
    return response;
  },

  // Update default screens
  updateDefaultScreens: async (screenIds) => {
    const response = await api.put('/screen-permissions/screens/default', { screenIds });
    return response;
  },

  // Initialize screens (admin only - run once)
  initializeScreens: async () => {
    const response = await api.post('/screen-permissions/screens/initialize');
    return response;
  },

  // Get my screens (logged-in user)
  getMyScreens: async () => {
    const response = await api.get('/screen-permissions/my-screens');
    return response;
  },

  // Get all users with their permissions summary
  getAllUsersWithPermissions: async () => {
    const response = await api.get('/screen-permissions/users');
    return response;
  },

  // Get screens for a specific user
  getUserScreens: async (userId) => {
    const response = await api.get(`/screen-permissions/users/${userId}/screens`);
    return response;
  },

  // Get user-specific permissions (additional screens)
  getUserSpecificPermissions: async (userId) => {
    const response = await api.get(`/screen-permissions/users/${userId}/permissions`);
    return response;
  },

  // Update user-specific permissions
  updateUserPermissions: async (userId, screenIds) => {
    const response = await api.put(`/screen-permissions/users/${userId}/permissions`, { screenIds });
    return response;
  }
};

export default screenPermissionService;
