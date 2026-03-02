import api from './api';


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


export const generateSKU = async () => {
  const response = await api.post('/settings/generate-sku');
  return response;
};

export const updateSKUConfig = async (config) => {
  const response = await api.put('/settings/sku-config', config);
  return response;
};

const settingsService = {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
  generateSKU,
  updateSKUConfig,
};

export default settingsService;
