import api from './api';
import { handleApiError } from './errorHandler';



const inventoryService = {

  getAll: async (params = {}) => {
    try {

      const endpoint = params.usePOSPricing ? '/inventory/pos' : '/inventory';


      const { usePOSPricing, ...backendParams } = params;

      const response = await api.get(endpoint, { params: backendParams });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load inventory items. Please check your connection.',
        server: 'Failed to load inventory. Please try again later.',
      });
    }
  },

  // Get inventory items with RouteStar alias mappings for truck checkout
  getAllForTruckCheckout: async () => {
    try {
      const response = await api.get('/inventory/truck-checkout');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load inventory items. Please check your connection.',
        server: 'Failed to load inventory. Please try again later.',
      });
    }
  },

  
  getById: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found. It may have been deleted.',
      });
    }
  },

  
  create: async (itemData) => {
    try {
      const response = await api.post('/inventory', itemData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        validation: 'Please check all required fields and try again.',
        conflict: 'An item with this SKU code already exists.',
        permission: 'You do not have permission to create inventory items.',
      });
    }
  },

  
  update: async (id, itemData) => {
    try {
      const response = await api.put(`/inventory/${id}`, itemData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found. It may have been deleted.',
        validation: 'Please check the item information and try again.',
        conflict: 'This SKU code is already in use by another item.',
        permission: 'You do not have permission to update inventory items.',
      });
    }
  },

  
  delete: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found. It may have already been deleted.',
        permission: 'You do not have permission to delete inventory items.',
        conflict: 'This item cannot be deleted. It may be referenced in other records.',
      });
    }
  },

  
  updateStock: async (id, stockData) => {
    try {
      const response = await api.patch(`/inventory/${id}/stock`, stockData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found.',
        validation: 'Invalid stock quantity or action. Please check your input.',
        conflict: 'Insufficient stock to remove the requested quantity.',
      });
    }
  },

  
  getHistory: async (id, limit = 50) => {
    try {
      const response = await api.get(`/inventory/${id}/history`, {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found.',
      });
    }
  },

  
  getLowStock: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load low stock items. Please check your connection.',
      });
    }
  },

  
  getCategories: async () => {
    try {
      const response = await api.get('/inventory/categories');
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load categories. Please check your connection.',
      });
    }
  },

  
  uploadImages: async (id, images, primaryIndex = 0) => {
    try {
      const formData = new FormData();

      
      if (images instanceof FileList) {
        Array.from(images).forEach((image) => {
          formData.append('images', image);
        });
      } else if (Array.isArray(images)) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      } else {
        formData.append('images', images);
      }

      
      formData.append('primary', primaryIndex.toString());

      const response = await api.post(`/inventory/${id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found.',
        validation: 'Invalid image file. Please ensure images are in supported formats (JPEG, PNG).',
        server: 'Failed to upload images. Please try again.',
      });
    }
  },

  
  deleteImage: async (id, imageId) => {
    try {
      const response = await api.delete(`/inventory/${id}/images/${imageId}`);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Image not found.',
      });
    }
  },

  
  setPrimaryImage: async (id, imageIndex) => {
    try {
      const response = await api.patch(`/inventory/${id}/images/primary`, {
        imageIndex,
      });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Image not found.',
      });
    }
  },

  
  generateInvoice: async (id, invoiceData) => {
    try {
      const response = await api.post(`/inventory/${id}/generate-invoice`, invoiceData);
      return response;
    } catch (error) {
      throw handleApiError(error, {
        notfound: 'Inventory item not found.',
        validation: 'Invalid invoice data. Please check all required fields.',
        conflict: 'Insufficient stock for this sale.',
      });
    }
  },
};

export default inventoryService;
