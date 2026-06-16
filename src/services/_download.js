import api from './api';
import { handleApiError } from './errorHandler';

const extensionFor = (format) => {
  if (format === 'csv') return 'csv';
  if (format === 'pdf') return 'pdf';
  return 'xlsx';
};

const todayISO = () => new Date().toISOString().split('T')[0];

export const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.URL.revokeObjectURL(url);
  }
};

export const downloadReport = async (path, params = {}, baseName, messages = {}) => {
  if (!params.format || params.format === 'json') {
    try {
      return await api.get(path, { params });
    } catch (error) {
      throw handleApiError(error, messages);
    }
  }
  try {
    const response = await api.get(path, { params, responseType: 'blob' });
    const contentType = response?.type;
    const filename = `${baseName}_${todayISO()}.${extensionFor(params.format)}`;
    const blob = contentType ? new Blob([response], { type: contentType }) : new Blob([response]);
    triggerBlobDownload(blob, filename);
    return { success: true, message: 'Report downloaded successfully' };
  } catch (error) {
    throw handleApiError(error, messages);
  }
};

export const downloadExport = async (path, params = {}, baseName, messages = {}) => {
  try {
    const response = await api.get(path, { params, responseType: 'blob' });
    const filename = `${baseName}_${todayISO()}.${extensionFor(params.format)}`;
    triggerBlobDownload(new Blob([response]), filename);
    return { success: true, message: 'Export completed successfully' };
  } catch (error) {
    throw handleApiError(error, messages);
  }
};
