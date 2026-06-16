import api from './api';
import { handleApiError } from './errorHandler';

export const wrap = (fn, messages) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    throw handleApiError(error, messages || {});
  }
};

export const wrapAll = (impl, messagesByKey = {}) => {
  const out = {};
  for (const key of Object.keys(impl)) {
    out[key] = wrap(impl[key], messagesByKey[key]);
  }
  return out;
};

export const createResource = (basePath, messages = {}) => ({
  getAll: wrap((params = {}) => api.get(basePath, { params }), messages.getAll),
  getById: wrap((id) => api.get(`${basePath}/${id}`), messages.getById),
  create: wrap((data) => api.post(basePath, data), messages.create),
  update: wrap((id, data) => api.put(`${basePath}/${id}`, data), messages.update),
  patch: wrap((id, data) => api.patch(`${basePath}/${id}`, data), messages.patch),
  delete: wrap((id) => api.delete(`${basePath}/${id}`), messages.delete),
});

export { api };
