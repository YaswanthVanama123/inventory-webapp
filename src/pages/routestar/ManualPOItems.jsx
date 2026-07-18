import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import { manualPOItemService } from '../../services/manualPOItemService';
import useDebounce from '../../hooks/useDebounce';
import useServerPagination from '../../hooks/useServerPagination';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchableSelect from '../../components/common/SearchableSelect';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { PlusIcon, PencilIcon, CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

const ManualPOItems = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [routeStarItems, setRouteStarItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ total: 0, mapped: 0, active: 0 });
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
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

  // Server-paginated items list. Dropdown sources (routeStarItems, vendors) and
  // stats ride along through `extra` as FULL sets.
  const {
    items: pageItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    extra,
    loading,
    refetch,
  } = useServerPagination(
    ({ page, limit }) =>
      manualPOItemService
        .getPageData({ page, limit, search: debouncedSearch || undefined })
        .then((pageData) => ({
          items: pageData.items || [],
          total: pageData.pagination?.total ?? 0,
          pages: pageData.pagination?.totalPages ?? 1,
          extra: {
            routeStarItems: pageData.routeStarItems || [],
            vendors: pageData.vendors || [],
            stats: pageData.stats || { total: 0, mapped: 0, active: 0 },
          },
        })),
    { pageSize: 20, resetKey: debouncedSearch }
  );

  useEffect(() => {
    if (!extra) return;
    setRouteStarItems(extra.routeStarItems || []);
    setVendors(extra.vendors || []);
    setStats(extra.stats || { total: 0, mapped: 0, active: 0 });
  }, [extra]);

  const loadData = refetch;

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        sku: item.sku || '',
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
        sku: '',
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
      sku: '',
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
      itemType: item ? item.type : ''
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
      const trimmedSku = (formData.sku || '').trim();
      if (trimmedSku) {
        submitData.sku = trimmedSku.toUpperCase();
      }

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

  const handleToggleActive = async (item) => {
    const newStatus = !item.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} SKU: ${item.sku}?${newStatus ? '' : '\n\nInactive items cannot be added to new orders, but existing orders remain unchanged.'}`)) {
      return;
    }

    try {
      await manualPOItemService.updateItem(item.sku, { isActive: newStatus });
      showSuccess(`Manual PO item ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadData();
    } catch (error) {
      showError(`Failed to ${action} item: ` + error.message);
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
      {}
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

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <Input
          type="text"
          placeholder="Search by SKU, name, description, vendor, or mapped item..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full"
        />
      </div>

      {}
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

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {pageItems.length === 0 ? (
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
                {pageItems.map((item) => (
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
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={item.isActive
                            ? "text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          }
                          title={item.isActive ? "Deactivate (block new orders)" : "Activate"}
                        >
                          {item.isActive ? (
                            <NoSymbolIcon className="w-5 h-5" />
                          ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                          )}
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

      {total > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            showPageSize={true}
            showResultCount={true}
          />
        </div>
      )}

      {}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Manual PO Item' : 'Add New Manual PO Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              SKU
            </label>
            <Input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder={editingItem ? '' : 'Leave blank to auto-generate (CUSTOM-NNN)'}
              className="w-full uppercase"
              autoComplete="off"
            />
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              {editingItem
                ? 'Editing the SKU will rename it on every linked manual order. Must be unique.'
                : 'Optional. Leave blank to auto-generate. Must be unique if you set one.'}
            </p>
          </div>

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
