import api from './api';

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
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/inventory', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get inventory item by ID
   * @param {string} id - Item ID
   * @returns {Promise} Response with item details
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new inventory item
   * @param {Object} itemData - Item data
   * @returns {Promise} Response with created item
   */
  create: async (itemData) => {
    try {
      const response = await api.post('/inventory', itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update inventory item
   * @param {string} id - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise} Response with updated item
   */
  update: async (id, itemData) => {
    try {
      const response = await api.put(`/inventory/${id}`, itemData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete inventory item (soft delete)
   * @param {string} id - Item ID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw error;
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
   */
  updateStock: async (id, stockData) => {
    try {
      const response = await api.patch(`/inventory/${id}/stock`, stockData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get stock history for an inventory item
   * @param {string} id - Item ID
   * @param {number} limit - Maximum number of history entries (default: 50)
   * @returns {Promise} Response with stock history
   */
  getHistory: async (id, limit = 50) => {
    try {
      const response = await api.get(`/inventory/${id}/history`, {
        params: { limit },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all low stock items
   * @returns {Promise} Response with low stock items
   */
  getLowStock: async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all unique categories
   * @returns {Promise} Response with categories list
   */
  getCategories: async () => {
    try {
      const response = await api.get('/inventory/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload images for an inventory item
   * @param {string} id - Item ID
   * @param {FileList|Array} images - Image files to upload
   * @param {number} primaryIndex - Index of primary image (default: 0)
   * @returns {Promise} Response with uploaded image URLs
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

      const response = await api.post(`/inventory/${id}/upload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an image from an inventory item
   * @param {string} id - Item ID
   * @param {string} imageUrl - Image URL to delete
   * @returns {Promise} Response confirming deletion
   */
  deleteImage: async (id, imageUrl) => {
    try {
      const response = await api.delete(`/inventory/${id}/images`, {
        data: { imageUrl },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set primary image for an inventory item
   * @param {string} id - Item ID
   * @param {string} imageUrl - Image URL to set as primary
   * @returns {Promise} Response confirming update
   */
  setPrimaryImage: async (id, imageUrl) => {
    try {
      const response = await api.patch(`/inventory/${id}/primary-image`, {
        imageUrl,
      });
      return response;
    } catch (error) {
      throw error;
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
   */
  generateInvoice: async (id, invoiceData) => {
    try {
      const response = await api.post(`/inventory/${id}/generate-invoice`, invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default inventoryService;
