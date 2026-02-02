import api from './api';

/**
 * Settings Service
 * API calls for managing system settings (categories, units, SKU)
 */

// Get all settings
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response;
};

// Categories
export const getCategories = async (includeInactive = false) => {
  const response = await api.get('/settings/categories', {
    params: { includeInactive },
  });
  return response;
};

export const addCategory = async (categoryData) => {
  const response = await api.post('/settings/categories', categoryData);
  return response;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/settings/categories/${id}`, categoryData);
  return response;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/settings/categories/${id}`);
  return response;
};

// Units
export const getUnits = async (includeInactive = false) => {
  const response = await api.get('/settings/units', {
    params: { includeInactive },
  });
  return response;
};

export const addUnit = async (unitData) => {
  const response = await api.post('/settings/units', unitData);
  return response;
};

export const updateUnit = async (id, unitData) => {
  const response = await api.put(`/settings/units/${id}`, unitData);
  return response;
};

export const deleteUnit = async (id) => {
  const response = await api.delete(`/settings/units/${id}`);
  return response;
};

// SKU Generation
export const generateSKU = async () => {
  const response = await api.post('/settings/generate-sku');
  return response;
};

export const updateSKUConfig = async (config) => {
  const response = await api.put('/settings/sku-config', config);
  return response;
};

const settingsService = {
  getSettings,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
  generateSKU,
  updateSKUConfig,
};

export default settingsService;
