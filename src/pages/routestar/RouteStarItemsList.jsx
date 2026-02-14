import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarItemsService from '../../services/routeStarItemsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { MagnifyingGlassIcon, ArrowPathIcon, CheckIcon, XMarkIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const RouteStarItemsList = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, forUse: 0, forSell: 0, both: 0, unmarked: 0 });
  const [filters, setFilters] = useState({ itemParents: [], types: [] });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 });

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedParent, setSelectedParent] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterForUse, setFilterForUse] = useState(false);
  const [filterForSell, setFilterForSell] = useState(false);

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [pagination.page, selectedParent, selectedType, selectedCategory, filterForUse, filterForSell]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        loadData();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchText || undefined,
        itemParent: selectedParent !== 'all' ? selectedParent : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        itemCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
        forUse: filterForUse ? 'true' : undefined,
        forSell: filterForSell ? 'true' : undefined
      };

      const [itemsData, statsData] = await Promise.all([
        routeStarItemsService.getItems(params),
        routeStarItemsService.getStats()
      ]);

      console.log('Items data:', itemsData);
      console.log('Stats data:', statsData);

      setItems(itemsData.items || []);
      setPagination(itemsData.pagination || { total: 0, page: 1, limit: 50, pages: 0 });
      setFilters(itemsData.filters || { itemParents: [], types: [] });
      setStats(statsData || { total: 0, forUse: 0, forSell: 0, both: 0, unmarked: 0 });
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagChange = async (itemId, flagType, currentValue) => {
    try {
      const updatedItem = await routeStarItemsService.updateItemFlags(itemId, {
        [flagType]: !currentValue
      });

      // Update local state
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, [flagType]: updatedItem[flagType] } : item
        )
      );

      // Reload stats
      const statsData = await routeStarItemsService.getStats();
      setStats(statsData);

      showSuccess('Item updated successfully');
    } catch (error) {
      showError('Failed to update item: ' + error.message);
    }
  };

  const handleCategoryChange = async (itemId, newCategory) => {
    try {
      const updatedItem = await routeStarItemsService.updateItemFlags(itemId, {
        itemCategory: newCategory
      });

      // Update local state
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, itemCategory: updatedItem.itemCategory } : item
        )
      );

      showSuccess('Item category updated successfully');
    } catch (error) {
      showError('Failed to update item category: ' + error.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL items? This action cannot be undone!')) {
      return;
    }

    try {
      setDeleting(true);
      const result = await routeStarItemsService.deleteAllItems();
      showSuccess(result.message);

      // Reload data
      await loadData();
    } catch (error) {
      showError('Failed to delete items: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSync = async () => {
    if (syncing) {
      showError('Sync already in progress. Please wait.');
      return;
    }

    if (!window.confirm('This will sync all items from RouteStar. This may take several minutes. Continue?')) {
      return;
    }

    try {
      setSyncing(true);
      showSuccess('Sync started... This may take a few minutes.');

      const result = await routeStarItemsService.syncItems();
      showSuccess(`Sync completed! Fetched: ${result.total}, Created: ${result.created}, Updated: ${result.updated}`);

      // Reload data
      await loadData();
    } catch (error) {
      // Handle specific error for sync already in progress
      if (error.response && error.response.status === 409) {
        showError('Another sync is already in progress. Please wait for it to complete.');
      } else {
        showError('Failed to sync items: ' + error.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          RouteStar Items List
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage items usage flags (For Use / For Sell)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">Total Items</div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-3xl font-bold">{stats.forUse}</div>
          <div className="text-sm opacity-90">For Use</div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-3xl font-bold">{stats.forSell}</div>
          <div className="text-sm opacity-90">For Sell</div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-3xl font-bold">{stats.both}</div>
          <div className="text-sm opacity-90">Both</div>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="text-3xl font-bold">{stats.unmarked}</div>
          <div className="text-sm opacity-90">Unmarked</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Item Parent Filter */}
            <Select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="all">All Parents</option>
              {filters.itemParents.map(parent => (
                <option key={parent} value={parent}>{parent}</option>
              ))}
            </Select>

            {/* Type Filter */}
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {filters.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>

            {/* Item Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Item">Item</option>
              <option value="Service">Service</option>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={loadData}
              size="sm"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleSync}
              disabled={syncing || deleting}
              size="sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              {syncing ? 'Syncing...' : 'Sync Items'}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              disabled={syncing || deleting}
              size="sm"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete All'}
            </Button>
          </div>

          {/* Flag Filters */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterForUse}
                onChange={(e) => setFilterForUse(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show only "For Use"</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterForSell}
                onChange={(e) => setFilterForSell(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show only "For Sell"</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty On Hand
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  For Use
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  For Sell
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.itemName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.itemParent || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.itemCategory || 'Item'}
                        onChange={(e) => handleCategoryChange(item._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Item">Item</option>
                        <option value="Service">Service</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                      {item.qtyOnHand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleFlagChange(item._id, 'forUse', item.forUse)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          item.forUse
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                        }`}
                        title={item.forUse ? 'Unmark for use' : 'Mark for use'}
                      >
                        {item.forUse ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleFlagChange(item._id, 'forSell', item.forSell)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          item.forSell
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                        }`}
                        title={item.forSell ? 'Unmark for sell' : 'Mark for sell'}
                      >
                        {item.forSell ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                      return <span key={page} className="px-2 py-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RouteStarItemsList;
