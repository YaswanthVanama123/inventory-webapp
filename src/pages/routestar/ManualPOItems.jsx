import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import { manualPOItemService } from '../../services/manualPOItemService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchableSelect from '../../components/common/SearchableSelect';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ManualPOItems = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [routeStarItems, setRouteStarItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mappedCategoryItemId: '',
    mappedCategoryItemName: '',
    itemType: '',
    vendorId: '',
    vendorName: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Memoize filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    if (!searchText) return items;

    const searchLower = searchText.toLowerCase();
    return items.filter(item =>
      item.sku.toLowerCase().includes(searchLower) ||
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.mappedCategoryItemName && item.mappedCategoryItemName.toLowerCase().includes(searchLower)) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchLower)) ||
      (item.vendorId?.name && item.vendorId.name.toLowerCase().includes(searchLower))
    );
  }, [items, searchText]);

  // Memoize stats calculations
  const stats = useMemo(() => ({
    total: items.length,
    mapped: items.filter(i => i.mappedCategoryItemId).length,
    active: items.filter(i => i.isActive).length
  }), [items]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const pageData = await manualPOItemService.getPageData();
      setItems(pageData.items || []);
      setRouteStarItems(pageData.routeStarItems || []);
      setVendors(pageData.vendors || []);
    } catch (error) {
      showError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        mappedCategoryItemId: item.mappedCategoryItemId || '',
        mappedCategoryItemName: item.mappedCategoryItemName || '',
        itemType: item.mappedCategoryItemId ? 'canonical' : '',
        vendorId: item.vendorId?._id || '',
        vendorName: item.vendorName || item.vendorId?.name || '',
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        mappedCategoryItemId: '',
        mappedCategoryItemName: '',
        itemType: '',
        vendorId: '',
        vendorName: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      mappedCategoryItemId: '',
      mappedCategoryItemName: '',
      itemType: '',
      vendorId: '',
      vendorName: '',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRouteStarItemChange = (itemId) => {
    const item = routeStarItems.find(i => i._id === itemId);
    setFormData(prev => ({
      ...prev,
      mappedCategoryItemId: itemId,
      mappedCategoryItemName: item ? item.itemName : '',
      itemType: item ? item.type : '' // 'canonical' or 'routestar'
    }));
  };

  const handleVendorChange = (vendorId) => {
    const vendor = vendors.find(v => v._id === vendorId);
    setFormData(prev => ({
      ...prev,
      vendorId: vendorId,
      vendorName: vendor ? vendor.name : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Item name is required');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name,
        description: formData.description,
        mappedCategoryItemId: formData.mappedCategoryItemId || null,
        mappedCategoryItemName: formData.mappedCategoryItemName || null,
        vendorId: formData.vendorId || null,
        vendorName: formData.vendorName || null,
        isActive: formData.isActive
      };

      if (editingItem) {
        await manualPOItemService.updateItem(editingItem.sku, submitData);
        showSuccess('Manual PO item updated successfully');
      } else {
        await manualPOItemService.createItem(submitData);
        showSuccess('Manual PO item created successfully');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      showError(error.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sku) => {
    if (!window.confirm(`Are you sure you want to delete SKU: ${sku}?`)) {
      return;
    }

    try {
      await manualPOItemService.deleteItem(sku);
      showSuccess('Manual PO item deleted successfully');
      loadData();
    } catch (error) {
      showError('Failed to delete item: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manual PO Items
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            Manage SKUs for manual purchase orders
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Item
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <Input
          type="text"
          placeholder="Search by SKU, name, description, vendor, or mapped item..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Total Items</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Mapped</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.mapped}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.active}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No items found"
            description={searchText ? "Try adjusting your search" : "Create your first manual PO item to get started"}
            action={
              !searchText && (
                <Button onClick={() => handleOpenModal()} variant="primary">
                  Add New Item
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Mapped Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-gray-400">
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.vendorName || item.vendorId?.name ? (
                        <div className="text-sm text-slate-900 dark:text-white">
                          {item.vendorName || item.vendorId?.name}
                        </div>
                      ) : (
                        <Badge variant="secondary">Not Set</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.mappedCategoryItemName ? (
                        <Badge variant="success">
                          {item.mappedCategoryItemName}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Mapped</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.sku)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Manual PO Item' : 'Add New Manual PO Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingItem && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                SKU
              </label>
              <Input
                type="text"
                value={editingItem.sku}
                disabled
                className="w-full bg-slate-100 dark:bg-gray-700"
              />
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                SKU is auto-generated and cannot be changed
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Item Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Item name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Map to Inventory Item
            </label>
            <SearchableSelect
              options={routeStarItems}
              value={formData.mappedCategoryItemId}
              onChange={handleRouteStarItemChange}
              placeholder="Select canonical or RouteStar item..."
              getOptionLabel={(option) => option.itemName}
              getOptionValue={(option) => option._id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Vendor
            </label>
            <SearchableSelect
              options={vendors}
              value={formData.vendorId}
              onChange={handleVendorChange}
              placeholder="Select vendor..."
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option._id}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-slate-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManualPOItems;
