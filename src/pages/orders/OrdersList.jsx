import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { getOrders, syncOrders, deleteAllOrders, deleteBulkOrdersByNumbers, syncAllOrderDetails } from '../../services/ordersService';
import purchaseOrderService from '../../services/purchaseOrderService';
import orderDiscrepancyService from '../../services/orderDiscrepancyService';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const OrdersList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingNew, setSyncingNew] = useState(false);
  const [syncingOld, setSyncingOld] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [orderRange, setOrderRange] = useState({ highest: null, lowest: null, totalOrders: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockProcessedFilter, setStockProcessedFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [syncLimit, setSyncLimit] = useState(0);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [verificationItems, setVerificationItems] = useState([]);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(30);
  const [lastAutoSync, setLastAutoSync] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, statusFilter, stockProcessedFilter, verifiedFilter, sourceFilter, dateFrom, dateTo, debouncedSearchTerm]);
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const intervalMs = autoSyncInterval * 60 * 1000;
    const autoSyncTimer = setInterval(async () => {
      if (!syncing) {
        try {
          console.log('Running auto-sync for orders...');
          const response = await syncOrders(0, 'new');
          if (response.success && (response.data.created > 0 || response.data.updated > 0)) {
            setLastAutoSync(new Date());
            fetchOrders();
            showSuccess(`Auto-sync: ${response.data.created} new, ${response.data.updated} updated orders`);
          }
        } catch (error) {
          console.error('Auto-sync error:', error);
        }
      }
    }, intervalMs);
    return () => clearInterval(autoSyncTimer);
  }, [autoSyncEnabled, autoSyncInterval, syncing]);
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
      if (verifiedFilter !== '') {
        params.verified = verifiedFilter;
      }
      if (sourceFilter) {
        params.source = sourceFilter;
      }
      if (dateFrom) {
        params.startDate = dateFrom;
      }
      if (dateTo) {
        params.endDate = dateTo;
      }
      if (debouncedSearchTerm) {
        params.vendor = debouncedSearchTerm;
      }
      const response = await getOrders(params);
      if (response.success) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalItems(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.page || 1);
        if (response.data.range) {
          setOrderRange({
            highest: response.data.range.highest,
            lowest: response.data.range.lowest,
            totalOrders: response.data.range.totalOrders
          });
        }
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
    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;
    setSyncingNew(true);
    setSyncing(true);
    try {
      const response = await syncOrders(limit, 'new');
      if (response.success) {
        const { created = 0, updated = 0, skipped = 0, total = 0 } = response.data;
        const limitText = isUnlimited ? 'AUTO (new orders only)' : limit;
        showSuccess(
          `Synced: ${created} new, ${updated} updated, ${skipped} skipped | Limit: ${limitText} | Range: #${orderRange.highest || 'N/A'}+`
        );
        fetchOrders();
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
    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;
    setSyncingOld(true);
    setSyncing(true);
    try {
      const response = await syncOrders(limit, 'old');
      if (response.success) {
        const { created = 0, updated = 0, skipped = 0, total = 0 } = response.data;
        const limitText = isUnlimited ? 'AUTO (all available)' : limit;
        showSuccess(
          `Synced: ${created} new, ${updated} updated, ${skipped} skipped | Limit: ${limitText} | Range: <#${orderRange.lowest || 'N/A'}`
        );
        fetchOrders();
      }
    } catch (err) {
      console.error('Error syncing old orders:', err);
      showError(err.message || 'Failed to sync old orders');
    } finally {
      setSyncingOld(false);
      setSyncing(false);
    }
  };
  const handleSyncAll = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync orders');
      return;
    }
    setSyncingAll(true);
    setSyncing(true);
    try {
      // First sync new orders (this creates fetch history)
      const ordersResponse = await syncOrders(0, 'new');
      if (ordersResponse.success) {
        const { created = 0, updated = 0, skipped = 0 } = ordersResponse.data;

        // Then sync order details for all orders without details
        let detailsSynced = 0;
        try {
          const detailsResponse = await syncAllOrderDetails(0);
          if (detailsResponse.success) {
            detailsSynced = detailsResponse.data.synced || 0;
          }
        } catch (detailsError) {
          console.error('Error syncing details:', detailsError);
        }

        showSuccess(
          `Full sync complete: ${created} new orders, ${updated} updated, ${detailsSynced} details synced`
        );
        fetchOrders();
      }
    } catch (err) {
      console.error('Error syncing all orders:', err);
      showError(err.message || 'Failed to sync all orders');
    } finally {
      setSyncingAll(false);
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
      }
    } catch (err) {
      console.error('Error deleting orders:', err);
      showError(err.message || 'Failed to delete orders');
    } finally {
      setDeleting(false);
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      return;
    }
    setCurrentPage(1);
  };
  const handleSearchClear = () => {
    setSearchTerm('');
  };
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleStockProcessedFilterChange = (e) => {
    setStockProcessedFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleVerifiedFilterChange = (e) => {
    setVerifiedFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleSourceFilterChange = (e) => {
    setSourceFilter(e.target.value);
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
    setVerifiedFilter('');
    setSourceFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      return params;
    });
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
      'Processing': 'info',
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
      const response = await deleteBulkOrdersByNumbers(selectedOrders);
      if (response.success) {
        showSuccess(`Successfully deleted ${response.data.deletedCount} order(s)`);
        setShowBulkDeleteModal(false);
        setSelectedOrders([]);
        fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to delete orders');
      }
    } catch (err) {
      console.error('Error deleting orders:', err);
      showError(err.message || 'Failed to delete orders');
    } finally {
      setDeletingBulk(false);
    }
  };
  const handleOpenVerifyModal = async (order) => {
    try {
      const response = await purchaseOrderService.getOrderById(order.orderNumber);
      if (response.success) {
        const orderData = response.data;
        setVerifyingOrder(orderData);
        setVerificationItems(orderData.items.map(item => ({
          ...item,
          previouslyReceived: item.receivedQuantity || 0,
          receivingNow: Math.max(0, (item.qty || 0) - (item.receivedQuantity || 0)),
          itemName: item.name
        })));
        setVerificationNotes('');
        setShowVerifyModal(true);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      showError('Failed to load order details');
    }
  };
  const handleQuantityChange = (index, value) => {
    const newItems = [...verificationItems];
    newItems[index].receivingNow = value;
    setVerificationItems(newItems);
  };
  const hasDiscrepancies = verificationItems.some(item => {
    const receivingNow = parseFloat(item.receivingNow || 0);
    const previouslyReceived = item.previouslyReceived || 0;
    const totalAfterThis = previouslyReceived + receivingNow;
    return totalAfterThis !== item.qty;
  });
  const handleVerifyAllGood = async () => {
    try {
      setSubmittingVerification(true);
      const response = await orderDiscrepancyService.verifyOrder(verifyingOrder._id, {
        allGood: true,
        notes: verificationNotes.trim() || 'All items received as expected'
      });
      if (response.success) {
        showSuccess('Order verified successfully - all items received');
        setShowVerifyModal(false);
        setVerifyingOrder(null);
        setVerificationItems([]);
        setVerificationNotes('');
        fetchOrders();
      }
    } catch (error) {
      console.error('Verify order error:', error);
      showError(error.response?.data?.message || 'Failed to verify order');
    } finally {
      setSubmittingVerification(false);
    }
  };
  const handleSubmitWithDiscrepancies = async () => {
    try {
      setSubmittingVerification(true);
      const itemsData = verificationItems.map(item => ({
        sku: item.sku,
        itemName: item.itemName || item.name,
        expectedQuantity: item.qty,
        receivedQuantity: parseFloat(item.receivingNow) || 0,
        notes: item.notes || ''
      }));
      const response = await orderDiscrepancyService.verifyOrder(verifyingOrder._id, {
        allGood: false,
        items: itemsData,
        notes: verificationNotes.trim()
      });
      if (response.success) {
        const { partiallyVerifiedItems = [], fullyReceived = false } = response.data;
        if (fullyReceived) {
          showSuccess('Order fully received and verified');
        } else {
          showSuccess(`Partial receipt recorded - ${partiallyVerifiedItems.length} item(s) still pending`);
        }
        setShowVerifyModal(false);
        setVerifyingOrder(null);
        setVerificationItems([]);
        setVerificationNotes('');
        fetchOrders();
      }
    } catch (error) {
      console.error('Submit discrepancies error:', error);
      showError(error.response?.data?.message || 'Failed to submit discrepancies');
    } finally {
      setSubmittingVerification(false);
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
    <div className="space-y-6 px-4 sm:px-6 pb-6">
      {}
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
                onClick={() => navigate('/orders/create')}
                variant="success"
                size="sm"
                className="whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Order
              </Button>
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
              <div className="relative group">
                <Button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  variant="success"
                  className="whitespace-nowrap"
                  title="Fetch all orders and details"
                >
                  {syncingAll ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Syncing All...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync All
                    </>
                  )}
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Fetch all orders and their details (full sync)
                </div>
              </div>
            </div>
          )}
        </div>
        {}
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
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-600 dark:text-gray-400">
                    orders per sync (0 = auto-detect new orders)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  0 (recommended): Only syncs NEW orders since your last sync. Skips existing orders with details already stored.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setSyncLimit(0)}
                  variant="secondary"
                  size="sm"
                >
                  Auto (0)
                </Button>
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
            {}
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    Automation Settings
                  </h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => {
                          setAutoSyncEnabled(e.target.checked);
                          if (e.target.checked) {
                            showSuccess(`Auto-sync enabled: will run every ${autoSyncInterval} minutes`);
                          } else {
                            showSuccess('Auto-sync disabled');
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        Enable Auto-Sync
                      </span>
                    </label>
                    {autoSyncEnabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600 dark:text-gray-400">
                          Every
                        </label>
                        <select
                          value={autoSyncInterval}
                          onChange={(e) => setAutoSyncInterval(parseInt(e.target.value))}
                          className="px-3 py-1 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value={5}>5 minutes</option>
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={240}>4 hours</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {autoSyncEnabled && lastAutoSync && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
                      Last auto-sync: {new Date(lastAutoSync).toLocaleTimeString()}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                    When enabled, automatically checks for new orders at the specified interval
                  </p>
                </div>
              </div>
            </div>
            {}
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
      {}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={handleSearch}
              onClear={handleSearchClear}
              placeholder="Search by vendor or order number..."
              fullWidth
              loading={loading && searchTerm !== debouncedSearchTerm}
            />
          </div>
          <Select
            value={sourceFilter}
            onChange={handleSourceFilterChange}
            className="w-full"
          >
            <option value="">All Sources</option>
            <option value="customerconnect">Synced</option>
            <option value="manual">Manual</option>
          </Select>
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
            <option value="">All Stock Status</option>
            <option value="true">Stock Processed</option>
            <option value="false">Not Processed</option>
          </Select>
          <Select
            value={verifiedFilter}
            onChange={handleVerifiedFilterChange}
            className="w-full"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </Select>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <Button
              onClick={handleClearFilters}
              variant="secondary"
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      </div>
      {}
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
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {orders.filter(o => !o.stockProcessed).length}
          </p>
        </div>
      </div>
      {}
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
            {}
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
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            #{order.orderNumber}
                          </div>
                          {order.source === 'manual' && (
                            <Badge variant="info" className="text-xs">MANUAL</Badge>
                          )}
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
                          <Badge variant="info">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {order.itemCount || 0} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          {!order.verified && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenVerifyModal(order);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium"
                            >
                              {order.items?.some(i => (i.receivedQuantity || 0) > 0 && (i.receivedQuantity || 0) < i.qty)
                                ? 'Verify Remaining'
                                : 'Verify Order'}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.orderNumber);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            {}
            <div className="border-t border-slate-200 dark:border-gray-700 p-4">
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
      {}
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
      {}
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
      {}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => !submittingVerification && setShowVerifyModal(false)}
        title="Verify Order Receipt"
        size="xl"
      >
        {verifyingOrder && (
          <div className="space-y-4">
            {}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Order Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {verifyingOrder.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Vendor
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {verifyingOrder.vendor?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Order Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(verifyingOrder.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Instructions:</strong> Enter the quantity being received now for each item. Previously received quantities are shown. If all remaining items are being received, click "All Good". Otherwise, adjust quantities and submit.
              </p>
            </div>
            {}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Previously Received
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Receiving Now
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {verificationItems.map((item, index) => {
                      const receivingNow = parseFloat(item.receivingNow) || 0;
                      const previouslyReceived = item.previouslyReceived || 0;
                      const expected = item.qty;
                      const totalAfterThis = previouslyReceived + receivingNow;
                      const remaining = Math.max(0, expected - totalAfterThis);
                      const isFullyReceived = totalAfterThis >= expected;
                      const isPartial = previouslyReceived > 0 && !isFullyReceived;
                      return (
                        <tr
                          key={index}
                          className={isPartial ? 'bg-blue-50 dark:bg-blue-900/10' : !isFullyReceived && receivingNow < (expected - previouslyReceived) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.sku}
                            </div>
                            {item.verificationHistory && item.verificationHistory.length > 0 && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {item.verificationHistory.length} previous receipt(s)
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                            {expected}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            {previouslyReceived > 0 ? (
                              <span className="font-medium text-blue-600 dark:text-blue-400">{previouslyReceived}</span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Input
                              type="number"
                              value={item.receivingNow}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              min="0"
                              step="1"
                              className="w-20 text-right"
                              required
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className={`text-sm font-bold ${
                              remaining === 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-orange-600 dark:text-orange-400'
                            }`}>
                              {remaining}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isFullyReceived ? (
                              <Badge variant="success">Complete</Badge>
                            ) : previouslyReceived > 0 ? (
                              <Badge variant="info">Partial</Badge>
                            ) : receivingNow < expected ? (
                              <Badge variant="info">Shortage</Badge>
                            ) : (
                              <Badge variant="success">Matched</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                rows="3"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add any notes about this order verification..."
              />
            </div>
            {}
            {hasDiscrepancies && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Some items will not be fully received after this verification. The remaining quantities will be tracked for future receipts.
                </p>
              </div>
            )}
            {}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowVerifyModal(false)}
                disabled={submittingVerification}
              >
                Cancel
              </Button>
              {!hasDiscrepancies ? (
                <Button
                  variant="success"
                  onClick={handleVerifyAllGood}
                  loading={submittingVerification}
                  disabled={submittingVerification}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All Good - Everything Received
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmitWithDiscrepancies}
                  loading={submittingVerification}
                  disabled={submittingVerification}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Submit Partial Receipt
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default OrdersList;
