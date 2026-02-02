import api from './api';
import { handleApiError } from './errorHandler';

/**
 * Inventory Service
 * Handles all inventory-related API calls
 */

const inventoryService = {
  /**
   * Get all inventory items with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search in itemName, skuCode, description
   * @param {boolean} params.lowStock - Filter low stock items
   * @returns {Promise} Response with items and pagination
   * @throws {Object} Formatted error with user-friendly message
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/inventory', { params });
      return response;
    } catch (error) {
      throw handleApiError(error, {
        network: 'Unable to load inventory items. Please check your connection.',
        server: 'Failed to load inventory. Please try again later.',
      });
    }
  },

  /**
   * Get inventory item by ID
   * @param {string} id - Item ID
   * @returns {Promise} Response with item details
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Create new inventory item
   * @param {Object} itemData - Item data
   * @returns {Promise} Response with created item
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Update inventory item
   * @param {string} id - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise} Response with updated item
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Delete inventory item (soft delete)
   * @param {string} id - Item ID
   * @returns {Promise} Response confirming deletion
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Update stock quantity of an inventory item
   * @param {string} id - Item ID
   * @param {Object} stockData - Stock update data
   * @param {number} stockData.quantity - Quantity to add/remove/set
   * @param {string} stockData.action - Action type: 'add', 'remove', 'set'
   * @param {string} stockData.reason - Optional reason for stock change
   * @returns {Promise} Response with updated item
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get stock history for an inventory item
   * @param {string} id - Item ID
   * @param {number} limit - Maximum number of history entries (default: 50)
   * @returns {Promise} Response with stock history
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get all low stock items
   * @returns {Promise} Response with low stock items
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Get all unique categories
   * @returns {Promise} Response with categories list
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Upload images for an inventory item
   * @param {string} id - Item ID
   * @param {FileList|Array} images - Image files to upload
   * @param {number} primaryIndex - Index of primary image (default: 0)
   * @returns {Promise} Response with uploaded image URLs
   * @throws {Object} Formatted error with user-friendly message
   */
  uploadImages: async (id, images, primaryIndex = 0) => {
    try {
      const formData = new FormData();

      // Add images to FormData
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

      // Add primary image index
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

  /**
   * Delete an image from an inventory item
   * @param {string} id - Item ID
   * @param {string} imageId - Image ID to delete
   * @returns {Promise} Response confirming deletion
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Set primary image for an inventory item
   * @param {string} id - Item ID
   * @param {number} imageIndex - Index of the image to set as primary
   * @returns {Promise} Response confirming update
   * @throws {Object} Formatted error with user-friendly message
   */
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

  /**
   * Generate invoice for an inventory item
   * @param {string} id - Item ID
   * @param {Object} invoiceData - Invoice data
   * @param {string} invoiceData.type - Invoice type: 'sale', 'purchase', 'stock_adjustment'
   * @param {number} invoiceData.quantity - Quantity
   * @param {string} invoiceData.customerName - Customer/supplier name
   * @param {string} invoiceData.customerEmail - Customer/supplier email
   * @param {string} invoiceData.customerAddress - Customer/supplier address
   * @param {string} invoiceData.notes - Optional notes
   * @param {boolean} invoiceData.includeQRCode - Include QR code (default: true)
   * @returns {Promise} Response with invoice details and PDF URL
   * @throws {Object} Formatted error with user-friendly message
   */
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
