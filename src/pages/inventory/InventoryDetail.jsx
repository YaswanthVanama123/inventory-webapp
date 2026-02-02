import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEmployee } = useAuth();
  const { showSuccess, showError } = useToast();

  // State management
  const [item, setItem] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // info, history, supplier

  // Image gallery state
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Modal states
  const [updateStockModal, setUpdateStockModal] = useState(false);
  const [uploadImagesModal, setUploadImagesModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [deleteImageModal, setDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  // Form states
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockAction, setStockAction] = useState('add');
  const [stockReason, setStockReason] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch item details and history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [itemResponse, historyResponse, activityResponse] = await Promise.all([
          inventoryService.getById(id),
          inventoryService.getHistory(id),
          api.get(`/activities?resource=INVENTORY&search=${id}&limit=100`),
        ]);

        setItem(itemResponse.data.item);
        setStockHistory(historyResponse.data || []);
        setActivityLogs(activityResponse.data?.activities || []);
      } catch (err) {
        setError(err.message || 'Failed to load item details');
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImage < (item?.images?.length || 1) - 1) {
      setSelectedImage(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    try {
      setActionLoading(true);
      await inventoryService.updateStock(id, {
        quantity: parseInt(stockQuantity),
        action: stockAction,
        reason: stockReason,
      });

      showSuccess('Stock updated successfully');

      // Refresh data
      const [itemResponse, historyResponse] = await Promise.all([
        inventoryService.getById(id),
        inventoryService.getHistory(id),
      ]);

      setItem(itemResponse.data.item);
      setStockHistory(historyResponse.data || []);

      // Reset form
      setStockQuantity('');
      setStockReason('');
      setUpdateStockModal(false);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to update stock';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle image upload
  const handleUploadImages = async () => {
    try {
      setActionLoading(true);
      await inventoryService.uploadImages(id, selectedFiles);

      showSuccess('Images uploaded successfully');

      // Refresh data
      const itemResponse = await inventoryService.getById(id);
      setItem(itemResponse.data.item);

      // Reset form
      setSelectedFiles([]);
      setUploadImagesModal(false);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload images';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    try {
      setActionLoading(true);
      await inventoryService.delete(id);
      showSuccess(`Successfully deleted "${item.itemName}"`);
      navigate('/inventory');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete item';
      showError(errorMessage);
      setDeleteConfirmModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to get image path (handle both string and object formats)
  const getImagePath = (image) => {
    let path = '';

    if (typeof image === 'string') {
      path = image;
    } else {
      path = image?.path || '/placeholder-product.png';
    }

    // If it's already a full URL (from ImgBB or other source), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // For legacy local images
    if (path.startsWith('/uploads')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendUrl}${path}`;
    }

    return path;
  };

  // Helper function to get image ID
  const getImageId = (image) => {
    if (typeof image === 'object' && image?._id) return image._id;
    return null;
  };

  // Handle delete image
  const handleDeleteImage = (image) => {
    const imageId = getImageId(image);
    if (!imageId) {
      showError('Cannot delete this image');
      return;
    }
    setImageToDelete({ id: imageId, path: getImagePath(image) });
    setDeleteImageModal(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      setActionLoading(true);
      await inventoryService.deleteImage(id, imageToDelete.id);

      showSuccess('Image removed successfully');

      // Refresh data
      const itemResponse = await inventoryService.getById(id);
      setItem(itemResponse.data.item);

      // Reset selected image if needed
      if (selectedImage >= (itemResponse.data.item.images?.length || 0)) {
        setSelectedImage(Math.max(0, (itemResponse.data.item.images?.length || 1) - 1));
      }

      setDeleteImageModal(false);
      setImageToDelete(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete image';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate profit margin
  const calculateProfitMargin = () => {
    if (!item?.purchasePrice || !item?.sellingPrice) return 0;
    const profit = item.sellingPrice - item.purchasePrice;
    return ((profit / item.purchasePrice) * 100).toFixed(2);
  };

  // Get stock badge variant
  const getStockBadgeVariant = () => {
    if (!item) return 'default';
    if (item.currentStock === 0) return 'danger';
    if (item.currentStock <= item.lowStockThreshold) return 'warning';
    return 'success';
  };

  // Check if low stock
  const isLowStock = () => {
    return item && item.currentStock <= item.lowStockThreshold && item.currentStock > 0;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading item details..." />;
  }

  if (error && !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
        <Button onClick={() => navigate('/inventory')} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="warning" title="Not Found">
          Item not found
        </Alert>
        <Button onClick={() => navigate('/inventory')} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images
    : ['/placeholder-product.png'];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/inventory')} className="mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inventory
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {item.itemName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              SKU: {item.skuCode}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(isEmployee || isAdmin) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setUpdateStockModal(true)}
              >
                Update Stock
              </Button>
            )}
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/inventory/edit/${id}`)}
                >
                  Edit Item
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadImagesModal(true)}
                >
                  Upload Images
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteConfirmModal(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {isLowStock() && (
        <Alert variant="warning" title="Low Stock Alert" dismissible className="mb-6">
          Current stock ({item.currentStock} units) is below the threshold ({item.lowStockThreshold} units).
          Consider restocking soon.
        </Alert>
      )}

      {item.currentStock === 0 && (
        <Alert variant="danger" title="Out of Stock" dismissible className="mb-6">
          This item is currently out of stock.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

      {/* Main Content - 2 Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          <Card padding="none" className="overflow-hidden">
            {/* Main Image */}
            <div
              className="relative bg-gray-100 dark:bg-gray-700 aspect-square cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={getImagePath(images[selectedImage])}
                alt={item.itemName}
                className="w-full h-full object-contain"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(Math.max(0, selectedImage - 1));
                    }}
                    disabled={selectedImage === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(Math.min(images.length - 1, selectedImage + 1));
                    }}
                    disabled={selectedImage === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-4 bg-white dark:bg-gray-800">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <div key={index} className="flex-shrink-0 relative group">
                      <button
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={getImagePath(image)}
                          alt={`${item.itemName} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      {isAdmin && images.length > 1 && getImagePath(image) !== '/placeholder-product.png' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image);
                          }}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                          title="Remove image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Item Information */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 sm:space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('supplier')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'supplier'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Supplier
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Information Tab */}
            {activeTab === 'info' && (
              <Card title="Item Details">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">
                        {item.category || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Current Stock
                      </label>
                      <div className="mt-1">
                        <Badge variant={getStockBadgeVariant()} size="lg">
                          {item.currentStock} units
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                      {item.description || 'No description available'}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Pricing
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Purchase Price
                        </label>
                        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                          ${item.purchasePrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Selling Price
                        </label>
                        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                          ${item.sellingPrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <label className="text-sm font-medium text-green-700 dark:text-green-400">
                          Profit Margin
                        </label>
                        <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
                          {calculateProfitMargin()}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stock Thresholds */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Stock Management
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Low Stock Threshold
                        </label>
                        <p className="mt-1 text-base text-gray-900 dark:text-white">
                          {item.lowStockThreshold || 0} units
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Last Updated
                        </label>
                        <p className="mt-1 text-base text-gray-900 dark:text-white">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Activity Log Section */}
                <Card title="Complete Activity History">
                  {activityLogs.length === 0 && stockHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No activity history available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Creation Info */}
                      {item?.createdBy && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Item Created
                              </h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                Created by <span className="font-semibold">{item.createdBy.fullName || item.createdBy.username}</span>
                              </p>
                              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Combined Timeline - Activity Logs */}
                      {activityLogs.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Activity Timeline
                          </h3>
                          <div className="relative">
                            {activityLogs.map((activity, index) => (
                              <div key={activity._id || index} className="relative pb-8 last:pb-0">
                                {/* Timeline line */}
                                {index < activityLogs.length - 1 && (
                                  <div className="absolute left-4 top-8 -bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                )}

                                <div className="relative flex items-start space-x-3">
                                  {/* Timeline dot */}
                                  <div
                                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                                      activity.action === 'CREATE'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : activity.action === 'UPDATE'
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : activity.action === 'DELETE'
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : activity.action === 'RESTORE'
                                        ? 'bg-purple-100 dark:bg-purple-900/30'
                                        : activity.action === 'STOCK_ADD'
                                        ? 'bg-teal-100 dark:bg-teal-900/30'
                                        : activity.action === 'STOCK_REDUCE'
                                        ? 'bg-orange-100 dark:bg-orange-900/30'
                                        : 'bg-gray-100 dark:bg-gray-900/30'
                                    }`}
                                  >
                                    <svg
                                      className={`h-4 w-4 ${
                                        activity.action === 'CREATE'
                                          ? 'text-green-600 dark:text-green-400'
                                          : activity.action === 'UPDATE'
                                          ? 'text-blue-600 dark:text-blue-400'
                                          : activity.action === 'DELETE'
                                          ? 'text-red-600 dark:text-red-400'
                                          : activity.action === 'RESTORE'
                                          ? 'text-purple-600 dark:text-purple-400'
                                          : activity.action === 'STOCK_ADD'
                                          ? 'text-teal-600 dark:text-teal-400'
                                          : activity.action === 'STOCK_REDUCE'
                                          ? 'text-orange-600 dark:text-orange-400'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      {activity.action === 'CREATE' ? (
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                      ) : activity.action === 'DELETE' ? (
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      ) : activity.action === 'UPDATE' ? (
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      ) : activity.action === 'RESTORE' ? (
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                      ) : (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                      )}
                                    </svg>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Badge
                                          variant={
                                            activity.action === 'CREATE' || activity.action === 'RESTORE'
                                              ? 'success'
                                              : activity.action === 'DELETE'
                                              ? 'danger'
                                              : activity.action === 'UPDATE'
                                              ? 'info'
                                              : 'default'
                                          }
                                        >
                                          {activity.action}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {activity.action === 'CREATE' && 'Item Created'}
                                          {activity.action === 'UPDATE' && 'Item Updated'}
                                          {activity.action === 'DELETE' && 'Item Deleted'}
                                          {activity.action === 'RESTORE' && 'Item Restored'}
                                          {activity.action === 'STOCK_ADD' && 'Stock Added'}
                                          {activity.action === 'STOCK_REDUCE' && 'Stock Reduced'}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(activity.timestamp).toLocaleString()}
                                      </span>
                                    </div>

                                    {activity.performedBy && (
                                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                        By: <span className="font-semibold">{activity.performedBy.fullName || activity.performedBy.username}</span>
                                      </p>
                                    )}

                                    {activity.details && (
                                      <div className="mt-2">
                                        {activity.details.itemName && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Item: {activity.details.itemName}
                                          </p>
                                        )}
                                        {activity.details.skuCode && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400">
                                            SKU: {activity.details.skuCode}
                                          </p>
                                        )}
                                        {activity.details.changes && (
                                          <details className="mt-2">
                                            <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                              View changes
                                            </summary>
                                            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                                              {JSON.stringify(activity.details.changes, null, 2)}
                                            </pre>
                                          </details>
                                        )}
                                      </div>
                                    )}

                                    {activity.ipAddress && (
                                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        IP: {activity.ipAddress}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stock History Section */}
                      {stockHistory.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Stock Movement History
                          </h3>
                          <div className="relative">
                            {stockHistory.map((entry, index) => (
                              <div key={entry._id || index} className="relative pb-8 last:pb-0">
                                {/* Timeline line */}
                                {index < stockHistory.length - 1 && (
                                  <div className="absolute left-4 top-8 -bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                )}

                                <div className="relative flex items-start space-x-3">
                                  {/* Timeline dot */}
                                  <div
                                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                                      entry.action === 'add'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : entry.action === 'remove'
                                        ? 'bg-red-100 dark:bg-red-900/30'
                                        : 'bg-blue-100 dark:bg-blue-900/30'
                                    }`}
                                  >
                                    <svg
                                      className={`h-4 w-4 ${
                                        entry.action === 'add'
                                          ? 'text-green-600 dark:text-green-400'
                                          : entry.action === 'remove'
                                          ? 'text-red-600 dark:text-red-400'
                                          : 'text-blue-600 dark:text-blue-400'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      {entry.action === 'add' ? (
                                        <path
                                          fillRule="evenodd"
                                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                          clipRule="evenodd"
                                        />
                                      ) : entry.action === 'remove' ? (
                                        <path
                                          fillRule="evenodd"
                                          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                          clipRule="evenodd"
                                        />
                                      ) : (
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                          clipRule="evenodd"
                                        />
                                      )}
                                    </svg>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {entry.action === 'add' && 'Stock Added'}
                                        {entry.action === 'remove' && 'Stock Removed'}
                                        {entry.action === 'set' && 'Stock Set'}
                                      </p>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(entry.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                      <span className="font-semibold">
                                        {entry.action === 'add' ? '+' : entry.action === 'remove' ? '-' : ''}
                                        {entry.quantity} units
                                      </span>
                                      {entry.previousStock !== undefined && entry.newStock !== undefined && (
                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                          ({entry.previousStock} → {entry.newStock})
                                        </span>
                                      )}
                                    </div>
                                    {entry.reason && (
                                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                                        {entry.reason}
                                      </p>
                                    )}
                                    {entry.updatedBy && (
                                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        By: {entry.updatedBy.username || 'Unknown'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Supplier Tab */}
            {activeTab === 'supplier' && (
              <Card title="Supplier Details">
                {item.supplier ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Supplier Name
                      </label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">
                        {item.supplier.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Contact Information
                      </label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">
                        {item.supplier.contact || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">
                        {item.supplier.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Address
                      </label>
                      <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                        {item.supplier.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No supplier information available
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Modal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          size="full"
          showCloseButton={true}
          className="bg-black/95"
        >
          <div className="relative flex items-center justify-center min-h-[80vh]">
            <img
              src={getImagePath(images[selectedImage])}
              alt={item.itemName}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === index ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Update Stock Modal */}
      {updateStockModal && (
        <Modal
          isOpen={updateStockModal}
          onClose={() => setUpdateStockModal(false)}
          title="Update Stock"
          footer={
            <>
              <Button variant="ghost" onClick={() => setUpdateStockModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStock}
                loading={actionLoading}
                disabled={!stockQuantity || parseInt(stockQuantity) <= 0}
              >
                Update Stock
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <select
                value={stockAction}
                onChange={(e) => setStockAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reason for stock update"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-medium">Current Stock:</span> {item.currentStock} units
                {stockQuantity && (
                  <>
                    <br />
                    <span className="font-medium">New Stock:</span>{' '}
                    {stockAction === 'add'
                      ? item.currentStock + parseInt(stockQuantity)
                      : stockAction === 'remove'
                      ? Math.max(0, item.currentStock - parseInt(stockQuantity))
                      : parseInt(stockQuantity)}{' '}
                    units
                  </>
                )}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Images Modal */}
      {uploadImagesModal && (
        <Modal
          isOpen={uploadImagesModal}
          onClose={() => setUploadImagesModal(false)}
          title="Upload Images"
          footer={
            <>
              <Button variant="ghost" onClick={() => setUploadImagesModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadImages}
                loading={actionLoading}
                disabled={selectedFiles.length === 0}
              >
                Upload Images
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedFiles.length} file(s) selected
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <Modal
          isOpen={deleteConfirmModal}
          onClose={() => {
            if (!actionLoading) {
              setDeleteConfirmModal(false);
            }
          }}
          title="Delete Inventory Item"
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteItem}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Warning: This action cannot be undone!</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    The item will be permanently removed from the inventory.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <strong>{item.itemName}</strong> (SKU: {item.skuCode})?
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Image Confirmation Modal */}
      {deleteImageModal && imageToDelete && (
        <Modal
          isOpen={deleteImageModal}
          onClose={() => {
            if (!actionLoading) {
              setDeleteImageModal(false);
              setImageToDelete(null);
            }
          }}
          title="Remove Image"
          size="sm"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteImageModal(false);
                  setImageToDelete(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteImage}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Remove
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will permanently remove the image from this item.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src={imageToDelete.path}
                alt="Image to delete"
                className="max-w-full h-32 object-contain rounded-lg"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryDetail;
