import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { getOrders, syncOrders, getOrderRange, deleteAllOrders } from '../../services/ordersService';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const OrdersList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingNew, setSyncingNew] = useState(false);
  const [syncingOld, setSyncingOld] = useState(false);
  const [orderRange, setOrderRange] = useState({ highest: null, lowest: null, totalOrders: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockProcessedFilter, setStockProcessedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [syncLimit, setSyncLimit] = useState(100);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchOrderRange();
  }, [currentPage, itemsPerPage, statusFilter, stockProcessedFilter, dateFrom, dateTo]);

  const fetchOrderRange = async () => {
    try {
      const response = await getOrderRange();
      if (response.success) {
        setOrderRange(response.data);
      }
    } catch (err) {
      console.error('Error fetching order range:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (stockProcessedFilter !== '') {
        params.stockProcessed = stockProcessedFilter;
      }

      if (dateFrom) {
        params.startDate = dateFrom;
      }

      if (dateTo) {
        params.endDate = dateTo;
      }

      if (searchTerm) {
        params.vendor = searchTerm;
      }

      const response = await getOrders(params);

      if (response.success) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalItems(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.page || 1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      showError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNew = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync orders');
      return;
    }

    // Use 0 to represent unlimited (Infinity doesn't serialize in JSON)
    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;

    setSyncingNew(true);
    setSyncing(true);
    try {
      const response = await syncOrders(limit, 'new');
      if (response.success) {
        const limitText = isUnlimited ? 'all' : limit;
        showSuccess(`Synced ${response.data.created || 0} new orders (${limitText} requested, newer than #${orderRange.highest || 'N/A'})`);
        fetchOrders();
        fetchOrderRange();
      }
    } catch (err) {
      console.error('Error syncing new orders:', err);
      showError(err.message || 'Failed to sync new orders');
    } finally {
      setSyncingNew(false);
      setSyncing(false);
    }
  };

  const handleSyncOld = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync orders');
      return;
    }

    // Use 0 to represent unlimited (Infinity doesn't serialize in JSON)
    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;

    setSyncingOld(true);
    setSyncing(true);
    try {
      const response = await syncOrders(limit, 'old');
      if (response.success) {
        const limitText = isUnlimited ? 'all' : limit;
        showSuccess(`Synced ${response.data.created || 0} old orders (${limitText} requested, older than #${orderRange.lowest || 'N/A'})`);
        fetchOrders();
        fetchOrderRange();
      }
    } catch (err) {
      console.error('Error syncing old orders:', err);
      showError(err.message || 'Failed to sync old orders');
    } finally {
      setSyncingOld(false);
      setSyncing(false);
    }
  };

  const handleDeleteAllOrders = async () => {
    if (!isAdmin) {
      showError('Only administrators can delete orders');
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteAllOrders();
      if (response.success) {
        showSuccess(`Successfully deleted ${response.data.deletedCount || 0} orders`);
        setShowDeleteModal(false);
        fetchOrders();
        fetchOrderRange();
      }
    } catch (err) {
      console.error('Error deleting orders:', err);
      showError(err.message || 'Failed to delete orders');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStockProcessedFilterChange = (e) => {
    setStockProcessedFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStockProcessedFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleViewOrder = (orderNumber) => {
    navigate(`/orders/${orderNumber}`);
  };

  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      'Complete': 'success',
      'Processing': 'warning',
      'Shipped': 'info',
      'Cancelled': 'danger',
      'Pending': 'secondary',
    };
    return statusMap[status] || 'secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleCheckboxChange = (orderNumber) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderNumber)) {
        return prev.filter(num => num !== orderNumber);
      } else {
        return [...prev, orderNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.orderNumber));
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) {
      showError('Please select orders to delete');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedOrders.length === 0) return;

    setDeletingBulk(true);
    try {
      // Make API call to delete selected orders
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customerconnect/orders/bulk-delete-by-numbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderNumbers: selectedOrders })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(`Successfully deleted ${data.data.deletedCount} order(s)`);
        setShowBulkDeleteModal(false);
        setSelectedOrders([]);
        fetchOrders();
        fetchOrderRange();
      } else {
        throw new Error(data.message || 'Failed to delete orders');
      }
    } catch (err) {
      console.error('Error deleting orders:', err);
      showError(err.message || 'Failed to delete orders');
    } finally {
      setDeletingBulk(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Purchase Orders
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
              Manage orders from MyCustomerConnect
            </p>
            {orderRange.highest && (
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                Range: #{orderRange.lowest} to #{orderRange.highest} ({orderRange.totalOrders} total)
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setShowSyncOptions(!showSyncOptions)}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {showSyncOptions ? 'Hide' : 'Options'}
              </Button>
              <div className="relative group">
                <Button
                  onClick={handleSyncNew}
                  disabled={syncing}
                  variant="primary"
                  className="whitespace-nowrap"
                  title="Fetch newer orders (higher order numbers)"
                >
                  {syncingNew ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      New Sync
                    </>
                  )}
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Fetch newer orders (higher than #{orderRange.highest || '...'})
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={handleSyncOld}
                  disabled={syncing}
                  variant="secondary"
                  className="whitespace-nowrap"
                  title="Fetch older orders (lower order numbers)"
                >
                  {syncingOld ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l5 5m0 0l5-5m-5 5V6" />
                      </svg>
                      Old Sync
                    </>
                  )}
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Fetch older orders (lower than #{orderRange.lowest || '...'})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sync Options Panel */}
        {isAdmin && showSyncOptions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Sync Limit
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    value={syncLimit}
                    onChange={(e) => setSyncLimit(e.target.value)}
                    className="w-32 px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="100"
                  />
                  <span className="text-sm text-slate-600 dark:text-gray-400">
                    orders per sync (0 = unlimited)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  Set to 0 or leave empty to fetch all available orders. Higher numbers may take longer.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setSyncLimit(50)}
                  variant="secondary"
                  size="sm"
                >
                  50
                </Button>
                <Button
                  onClick={() => setSyncLimit(100)}
                  variant="secondary"
                  size="sm"
                >
                  100
                </Button>
                <Button
                  onClick={() => setSyncLimit(500)}
                  variant="secondary"
                  size="sm"
                >
                  500
                </Button>
                <Button
                  onClick={() => setSyncLimit(0)}
                  variant="secondary"
                  size="sm"
                >
                  All
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                    Delete all orders from the database (this cannot be undone)
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  size="sm"
                  disabled={deleting || totalItems === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Orders
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by vendor..."
            className="w-full"
          />

          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full"
          >
            <option value="">All Statuses</option>
            <option value="Complete">Complete</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </Select>

          <Select
            value={stockProcessedFilter}
            onChange={handleStockProcessedFilterChange}
            className="w-full"
          >
            <option value="">All Orders</option>
            <option value="true">Stock Processed</option>
            <option value="false">Not Processed</option>
          </Select>

          <Button
            onClick={handleClearFilters}
            variant="secondary"
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={handleDateToChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalItems}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Processed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {orders.filter(o => o.stockProcessed).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {orders.filter(o => !o.stockProcessed).length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="No purchase orders match your current filters"
            action={
              isAdmin ? (
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleSyncNew} variant="primary">
                    New Sync
                  </Button>
                  <Button onClick={handleSyncOld} variant="secondary">
                    Old Sync
                  </Button>
                </div>
              ) : null
            }
          />
        ) : (
          <>
            {/* Bulk Actions Toolbar */}
            {isAdmin && orders.length > 0 && (
              <div className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                      Select All ({selectedOrders.length}/{orders.length})
                    </span>
                  </label>

                  {selectedOrders.length > 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected ({selectedOrders.length})
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
                  <tr>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider w-12">
                        <span className="sr-only">Select</span>
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  {orders.map((order) => {
                    const isSelected = selectedOrders.includes(order.orderNumber);
                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleViewOrder(order.orderNumber)}
                      >
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(order.orderNumber)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          #{order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {order.vendor?.name || 'N/A'}
                        </div>
                        {order.vendor?.id && (
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            ID: {order.vendor.id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.stockProcessed ? (
                          <Badge variant="success">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.orderNumber);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-200 dark:border-gray-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handlePageSizeChange}
                totalItems={totalItems}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Orders"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  Warning: This action cannot be undone!
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are about to permanently delete <strong>{totalItems}</strong> order{totalItems !== 1 ? 's' : ''} from the database.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-gray-300">
              This will remove:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-gray-400 space-y-1 ml-4">
              <li>All order records and their details</li>
              <li>Order line items and SKU information</li>
              <li>Stock processing history for these orders</li>
            </ul>
            <p className="text-sm text-slate-700 dark:text-gray-300 mt-4">
              <strong>Note:</strong> This will NOT affect your inventory stock levels. Only order records will be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="secondary"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAllOrders}
              variant="danger"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete All Orders
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          if (!deletingBulk) {
            setShowBulkDeleteModal(false);
          }
        }}
        title="Delete Selected Orders"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  Warning: This action cannot be undone!
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are about to permanently delete <strong>{selectedOrders.length}</strong> selected order{selectedOrders.length !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">
              Selected Orders:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto">
              <ul className="space-y-1">
                {selectedOrders.map(orderNumber => {
                  const order = orders.find(o => o.orderNumber === orderNumber);
                  return (
                    <li key={orderNumber} className="text-sm text-slate-700 dark:text-gray-300">
                      <span className="font-semibold">#{orderNumber}</span>
                      {order && (
                        <>
                          <span className="text-slate-500 dark:text-gray-400 ml-2">
                            - {order.vendor?.name || 'N/A'}
                          </span>
                          <span className="text-slate-500 dark:text-gray-400 ml-2">
                            ({formatCurrency(order.total)})
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowBulkDeleteModal(false)}
              variant="secondary"
              disabled={deletingBulk}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkDelete}
              variant="danger"
              disabled={deletingBulk}
            >
              {deletingBulk ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected Orders
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersList;
