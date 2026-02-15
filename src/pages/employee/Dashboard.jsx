import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import inventoryService from '../../services/inventoryService';
import reportService from '../../services/reportService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    itemsUpdatedToday: 0,
  });
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickUpdateLoading, setQuickUpdateLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quickUpdateData, setQuickUpdateData] = useState({
    quantity: '',
    action: 'add',
    reason: '',
  });

  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      
      const inventoryResponse = await inventoryService.getAll({ limit: 1000 });
      const items = inventoryResponse.data.items || [];

      
      const totalItems = items.length;

      
      const lowStockItemsData = items.filter(
        (item) => item.currentStock <= item.minimumStock
      );
      const lowStockCount = lowStockItemsData.length;

      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const itemsUpdatedToday = items.filter((item) => {
        const updatedDate = new Date(item.updatedAt);
        updatedDate.setHours(0, 0, 0, 0);
        return updatedDate.getTime() === today.getTime();
      }).length;

      setStats({
        totalItems,
        lowStockItems: lowStockCount,
        itemsUpdatedToday,
      });

      
      const sortedItems = [...items].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setRecentUpdates(sortedItems.slice(0, 5));

      
      setLowStockItems(lowStockItemsData.slice(0, 5));

      
      try {
        const activityResponse = await reportService.recentActivity(10);
        setRecentActivity(activityResponse.data.activities || []);
      } catch (activityErr) {
        console.warn('Could not fetch recent activity:', activityErr);
        
        setRecentActivity([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  
  const handleUpdateStock = () => {
    navigate('/inventory');
  };

  const handleViewLowStock = () => {
    navigate('/inventory?filter=lowStock');
  };

  const handleSearchInventory = () => {
    navigate('/inventory');
  };

  const handleViewItem = (itemId) => {
    navigate(`/inventory/${itemId}`);
  };

  
  const handleQuickStockUpdate = async (e) => {
    e.preventDefault();

    if (!selectedItem || !quickUpdateData.quantity) {
      showToast('warning', 'Please select an item and enter quantity');
      return;
    }

    setQuickUpdateLoading(true);
    try {
      await inventoryService.updateStock(selectedItem._id, {
        quantity: parseInt(quickUpdateData.quantity),
        action: quickUpdateData.action,
        reason: quickUpdateData.reason || 'Quick update from employee dashboard',
      });

      showToast('success', `Stock ${quickUpdateData.action === 'add' ? 'added to' : quickUpdateData.action === 'remove' ? 'removed from' : 'updated for'} ${selectedItem.itemName}`);

      
      setSelectedItem(null);
      setQuickUpdateData({
        quantity: '',
        action: 'add',
        reason: '',
      });

      
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating stock:', err);
      showToast('error', err.message || 'Failed to update stock');
    } finally {
      setQuickUpdateLoading(false);
    }
  };

  
  const handleCancelQuickUpdate = () => {
    setSelectedItem(null);
    setQuickUpdateData({
      quantity: '',
      action: 'add',
      reason: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here's your inventory overview for today
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card
            padding="normal"
            hover
            onClick={handleSearchInventory}
            className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Items
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalItems}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Click to search inventory
            </p>
          </Card>

          <Card
            padding="normal"
            hover
            onClick={handleViewLowStock}
            className={`cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg ${
              stats.lowStockItems > 0
                ? 'ring-2 ring-red-500 dark:ring-red-400'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Low Stock Items
                </p>
                <p
                  className={`mt-2 text-3xl font-bold ${
                    stats.lowStockItems > 0
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                  }`}
                >
                  {stats.lowStockItems}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg shadow-lg ${
                  stats.lowStockItems > 0
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}
              >
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
            </div>
            {stats.lowStockItems > 0 && (
              <div className="mt-4 flex items-center text-xs text-red-600 dark:text-red-400 font-medium">
                <svg
                  className="w-4 h-4 mr-1 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Needs attention
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Click to view low stock items
            </p>
          </Card>

          <Card
            padding="normal"
            className="sm:col-span-2 lg:col-span-1 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Updated Today
                </p>
                <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.itemsUpdatedToday}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Items modified today
            </p>
          </Card>
        </div>

        <Card title="Quick Stock Update" className="mb-6 sm:mb-8">
          <form onSubmit={handleQuickStockUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Item
                </label>
                <select
                  value={selectedItem?._id || ''}
                  onChange={(e) => {
                    const item = recentUpdates.find(i => i._id === e.target.value) ||
                                 lowStockItems.find(i => i._id === e.target.value);
                    setSelectedItem(item);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={quickUpdateLoading}
                >
                  <option value="">Choose an item...</option>
                  <optgroup label="Recent Items">
                    {recentUpdates.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.itemName} (Stock: {item.currentStock})
                      </option>
                    ))}
                  </optgroup>
                  {lowStockItems.length > 0 && (
                    <optgroup label="Low Stock Items">
                      {lowStockItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.itemName} (Stock: {item.currentStock})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action
                </label>
                <select
                  value={quickUpdateData.action}
                  onChange={(e) => setQuickUpdateData({ ...quickUpdateData, action: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={quickUpdateLoading}
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
                  value={quickUpdateData.quantity}
                  onChange={(e) => setQuickUpdateData({ ...quickUpdateData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={quickUpdateLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={quickUpdateData.reason}
                onChange={(e) => setQuickUpdateData({ ...quickUpdateData, reason: e.target.value })}
                placeholder="Enter reason for stock update"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={quickUpdateLoading}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={quickUpdateLoading || !selectedItem}
                className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {quickUpdateLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Stock'
                )}
              </button>
              {selectedItem && (
                <button
                  type="button"
                  onClick={handleCancelQuickUpdate}
                  disabled={quickUpdateLoading}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <Card title="Low Stock Alerts" className="h-fit">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  All stock levels are good
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No items need restocking at this time
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.itemName}
                        </h4>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>SKU: {item.skuCode}</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Stock: {item.currentStock}/{item.minimumStock}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewItem(item._id)}
                      className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent Inventory Changes" className="h-fit">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No recent activity
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Recent changes will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.action === 'CREATE' ? 'bg-green-500' :
                      activity.action === 'UPDATE' ? 'bg-blue-500' :
                      activity.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description || `${activity.action} on ${activity.resource}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.performedBy?.username || 'System'} • {getTimeAgo(activity.timestamp || activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card title="Recent Stock Updates" className="mb-6 sm:mb-8">
          {recentUpdates.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No updates yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Recent inventory updates will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Item
                      </th>
                      <th
                        scope="col"
                        className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        SKU
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Updated
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentUpdates.map((item) => {
                      const isLowStock = item.currentStock <= item.minimumStock;
                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.itemName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                  {item.skuCode}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {item.skuCode}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isLowStock
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}
                              >
                                {item.currentStock}
                              </span>
                              {isLowStock && (
                                <svg
                                  className="ml-1 w-4 h-4 text-red-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="hidden sm:block">
                              {formatDateTime(item.updatedAt)}
                            </div>
                            <div className="sm:hidden text-xs">
                              {getTimeAgo(item.updatedAt)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewItem(item._id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleUpdateStock}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="font-medium">Update Stock</span>
          </button>

          <button
            onClick={handleViewLowStock}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            <span className="font-medium">View Low Stock</span>
          </button>

          <button
            onClick={handleSearchInventory}
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="font-medium">Search Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
