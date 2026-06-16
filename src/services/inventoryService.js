import api from './api';
import { wrap } from './_factory';

const inventoryService = {
  getAll: wrap(async (params = {}) => {
    const endpoint = params.usePOSPricing ? '/inventory/pos' : '/inventory';
    const { usePOSPricing, ...backendParams } = params;
    return api.get(endpoint, { params: backendParams });
  }, {
    network: 'Unable to load inventory items. Please check your connection.',
    server: 'Failed to load inventory. Please try again later.',
  }),

  getAllForTruckCheckout: wrap(() => api.get('/inventory/truck-checkout'), {
    network: 'Unable to load inventory items. Please check your connection.',
    server: 'Failed to load inventory. Please try again later.',
  }),

  getById: wrap((id) => api.get(`/inventory/${id}`), {
    notfound: 'Inventory item not found. It may have been deleted.',
  }),

  create: wrap((itemData) => api.post('/inventory', itemData), {
    validation: 'Please check all required fields and try again.',
    conflict: 'An item with this SKU code already exists.',
    permission: 'You do not have permission to create inventory items.',
  }),

  update: wrap((id, itemData) => api.put(`/inventory/${id}`, itemData), {
    notfound: 'Inventory item not found. It may have been deleted.',
    validation: 'Please check the item information and try again.',
    conflict: 'This SKU code is already in use by another item.',
    permission: 'You do not have permission to update inventory items.',
  }),

  delete: wrap((id) => api.delete(`/inventory/${id}`), {
    notfound: 'Inventory item not found. It may have already been deleted.',
    permission: 'You do not have permission to delete inventory items.',
    conflict: 'This item cannot be deleted. It may be referenced in other records.',
  }),

  updateStock: wrap((id, stockData) => api.patch(`/inventory/${id}/stock`, stockData), {
    notfound: 'Inventory item not found.',
    validation: 'Invalid stock quantity or action. Please check your input.',
    conflict: 'Insufficient stock to remove the requested quantity.',
  }),

  getHistory: wrap((id, limit = 50) => api.get(`/inventory/${id}/history`, { params: { limit } }), {
    notfound: 'Inventory item not found.',
  }),

  getLowStock: wrap(() => api.get('/inventory/low-stock'), {
    network: 'Unable to load low stock items. Please check your connection.',
  }),

  uploadImages: wrap((id, images, primaryIndex = 0) => {
    const formData = new FormData();
    if (images instanceof FileList) {
      Array.from(images).forEach((image) => formData.append('images', image));
    } else if (Array.isArray(images)) {
      images.forEach((image) => formData.append('images', image));
    } else {
      formData.append('images', images);
    }
    formData.append('primary', primaryIndex.toString());
    return api.post(`/inventory/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }, {
    notfound: 'Inventory item not found.',
    validation: 'Invalid image file. Please ensure images are in supported formats (JPEG, PNG).',
    server: 'Failed to upload images. Please try again.',
  }),

  deleteImage: wrap((id, imageId) => api.delete(`/inventory/${id}/images/${imageId}`), {
    notfound: 'Image not found.',
  }),

  setPrimaryImage: wrap((id, imageIndex) => api.patch(`/inventory/${id}/images/primary`, { imageIndex }), {
    notfound: 'Image not found.',
  }),

  generateInvoice: wrap((id, invoiceData) => api.post(`/inventory/${id}/generate-invoice`, invoiceData), {
    notfound: 'Inventory item not found.',
    validation: 'Invalid invoice data. Please check all required fields.',
    conflict: 'Insufficient stock for this sale.',
  }),
};

export default inventoryService;
