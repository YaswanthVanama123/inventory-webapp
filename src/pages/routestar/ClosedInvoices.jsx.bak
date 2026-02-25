import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { getInvoices, syncClosedInvoices, syncClosedInvoicesWithDetails, syncClosedInvoiceDetails, syncAllInvoiceDetails, getInvoiceRange, deleteAllClosedInvoices, deleteBulkClosedInvoicesByNumbers } from '../../services/routestarService';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ClosedInvoices = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingNew, setSyncingNew] = useState(false);
  const [syncingOld, setSyncingOld] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingDetails, setSyncingDetails] = useState(false);
  const [invoiceRange, setInvoiceRange] = useState({ highest: null, lowest: null, totalInvoices: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockProcessedFilter, setStockProcessedFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [syncLimit, setSyncLimit] = useState(0); 
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchInvoiceRange();
  }, [currentPage, itemsPerPage, statusFilter, stockProcessedFilter, dateFrom, dateTo]);

  const fetchInvoiceRange = async () => {
    try {
      const response = await getInvoiceRange('closed');
      if (response.success) {
        setInvoiceRange(response.data);
      }
    } catch (err) {
      console.error('Error fetching invoice range:', err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        invoiceType: 'closed',
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
        params.customer = searchTerm;
      }

      const response = await getInvoices(params);

      if (response.success) {
        setInvoices(response.data.invoices || []);
        setTotalPages(response.data.pagination.pages || 1);
        setTotalItems(response.data.pagination.total || 0);
        setCurrentPage(response.data.pagination.page || 1);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      showError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNew = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync invoices');
      return;
    }

    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;

    setSyncingNew(true);
    setSyncing(true);
    try {
      const response = await syncClosedInvoices(limit, 'new');
      if (response.success) {
        const { created = 0, updated = 0, skipped = 0 } = response.data;
        const limitText = isUnlimited ? 'AUTO (new invoices only)' : limit;
        showSuccess(
          `Synced: ${created} new, ${updated} updated, ${skipped} skipped | Limit: ${limitText} | Range: #${invoiceRange.highest || 'N/A'}+`
        );
        fetchInvoices();
        fetchInvoiceRange();
      }
    } catch (err) {
      console.error('Error syncing new invoices:', err);
      showError(err.message || 'Failed to sync new invoices');
    } finally {
      setSyncingNew(false);
      setSyncing(false);
    }
  };

  const handleSyncOld = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync invoices');
      return;
    }

    const limit = syncLimit === 0 || syncLimit === '' ? 0 : parseInt(syncLimit);
    const isUnlimited = limit === 0;

    setSyncingOld(true);
    setSyncing(true);
    try {
      const response = await syncClosedInvoices(limit, 'old');
      if (response.success) {
        const { created = 0, updated = 0, skipped = 0 } = response.data;
        const limitText = isUnlimited ? 'AUTO (all available)' : limit;
        showSuccess(
          `Synced: ${created} new, ${updated} updated, ${skipped} skipped | Limit: ${limitText} | Range: <#${invoiceRange.lowest || 'N/A'}`
        );
        fetchInvoices();
        fetchInvoiceRange();
      }
    } catch (err) {
      console.error('Error syncing old invoices:', err);
      showError(err.message || 'Failed to sync old invoices');
    } finally {
      setSyncingOld(false);
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync invoices');
      return;
    }

    setSyncingAll(true);
    setSyncing(true);
    try {
      
      const response = await syncClosedInvoicesWithDetails(0, 'new');
      if (response.success) {
        const invoices = response.data.invoices || {};
        const details = response.data.details || {};
        const totalInvoices = (invoices.created || 0) + (invoices.updated || 0);
        const totalDetails = details.synced || 0;

        showSuccess(`Synced ${totalInvoices} invoices (${invoices.created || 0} created, ${invoices.updated || 0} updated) and ${totalDetails} details`);
        fetchInvoices();
        fetchInvoiceRange();
      }
    } catch (err) {
      console.error('Error syncing all invoices:', err);
      showError(err.message || 'Failed to sync all invoices');
    } finally {
      setSyncingAll(false);
      setSyncing(false);
    }
  };

  const handleSyncDetails = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync invoice details');
      return;
    }

    setSyncingDetails(true);
    setSyncing(true);
    try {
      const response = await syncClosedInvoiceDetails(0);
      if (response.success) {
        showSuccess(`Synced details for ${response.data.synced || 0} closed invoices (${response.data.skipped || 0} skipped)`);
        fetchInvoices();
      }
    } catch (err) {
      console.error('Error syncing closed invoice details:', err);
      showError(err.message || 'Failed to sync closed invoice details');
    } finally {
      setSyncingDetails(false);
      setSyncing(false);
    }
  };

  const handleClearInvoices = async () => {
    if (!isAdmin) {
      showError('Only administrators can delete invoices');
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteAllClosedInvoices();
      if (response.success) {
        showSuccess(`Deleted ${response.data.deletedCount} closed invoices`);
        setShowDeleteConfirm(false);
        fetchInvoices();
        fetchInvoiceRange();
      }
    } catch (err) {
      console.error('Error deleting closed invoices:', err);
      showError(err.message || 'Failed to delete closed invoices');
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

  const handleViewInvoice = (invoiceNumber) => {
    navigate(`/invoices/routestar/${invoiceNumber}`);
  };

  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      'Completed': 'success',
      'Pending': 'warning',
      'Closed': 'info',
      'Cancelled': 'danger',
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

  const handleCheckboxChange = (invoiceNumber) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceNumber)) {
        return prev.filter(num => num !== invoiceNumber);
      } else {
        return [...prev, invoiceNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(invoice => invoice.invoiceNumber));
    }
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.length === 0) {
      showError('Please select invoices to delete');
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedInvoices.length === 0) return;

    setDeletingBulk(true);
    try {
      const response = await deleteBulkClosedInvoicesByNumbers(selectedInvoices);

      if (response.success) {
        showSuccess(`Successfully deleted ${response.data.deletedCount} invoice(s)`);
        setShowBulkDeleteModal(false);
        setSelectedInvoices([]);
        fetchInvoices();
        fetchInvoiceRange();
      } else {
        throw new Error(response.message || 'Failed to delete invoices');
      }
    } catch (err) {
      console.error('Error deleting invoices:', err);
      showError(err.message || 'Failed to delete invoices');
    } finally {
      setDeletingBulk(false);
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Closed Invoices
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
              Sales invoices from RouteStar (Closed)
            </p>
            {invoiceRange.highest && (
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                Range: #{invoiceRange.lowest} to #{invoiceRange.highest} ({invoiceRange.totalInvoices} total)
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 items-center flex-wrap">
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
                  title="Fetch newer invoices (higher invoice numbers)"
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
                  Fetch newer invoices (higher than #{invoiceRange.highest || '...'})
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={handleSyncOld}
                  disabled={syncing}
                  variant="secondary"
                  className="whitespace-nowrap"
                  title="Fetch older invoices (lower invoice numbers)"
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
                  Fetch older invoices (lower than #{invoiceRange.lowest || '...'})
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  variant="success"
                  className="whitespace-nowrap"
                  title="Fetch all invoices from RouteStar"
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
                  Fetch all invoices and their details (2 steps)
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={handleSyncDetails}
                  disabled={syncing}
                  variant="info"
                  className="whitespace-nowrap"
                  title="Fetch detailed line items for CLOSED invoices"
                >
                  {syncingDetails ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Sync Details
                    </>
                  )}
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Fetch line items for CLOSED invoices without details
                </div>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="danger"
                size="sm"
                className="whitespace-nowrap"
                disabled={totalItems === 0}
                title={`Delete all ${totalItems} closed invoices`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All ({totalItems})
              </Button>
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
                    invoices per sync (0 = auto-detect new invoices)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  0 (recommended): Only syncs NEW invoices since your last sync. Higher numbers fetch that many invoices regardless.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setSyncLimit(0)} variant="secondary" size="sm">Auto (0)</Button>
                <Button onClick={() => setSyncLimit(50)} variant="secondary" size="sm">50</Button>
                <Button onClick={() => setSyncLimit(100)} variant="secondary" size="sm">100</Button>
                <Button onClick={() => setSyncLimit(500)} variant="secondary" size="sm">500</Button>
              </div>
            </div>

            {}
            <div className="border-t border-blue-200 dark:border-blue-800 mt-4 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400">
                    Clear all closed invoices from the database ({totalItems} invoices)
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  size="sm"
                  disabled={totalItems === 0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Closed Invoices
                </Button>
              </div>
            </div>
          </div>
        )}

        {}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete all <strong>{totalItems} closed invoices</strong>?
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This will permanently delete all closed invoices from the database. You will need to sync again to restore them.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClearInvoices}
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
                      Yes, Delete All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by customer..."
            className="w-full"
          />

          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>

          <Select
            value={stockProcessedFilter}
            onChange={handleStockProcessedFilterChange}
            className="w-full"
          >
            <option value="">All Invoices</option>
            <option value="true">Stock Processed</option>
            <option value="false">Not Processed</option>
          </Select>

          <Button onClick={handleClearFilters} variant="secondary" className="w-full">
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

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Total Closed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalItems}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Processed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {invoices.filter(i => i.stockProcessed).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-slate-600 dark:text-gray-400">Pending Processing</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {invoices.filter(i => !i.stockProcessed).length}
          </p>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <EmptyState
            title="No closed invoices found"
            description="No closed invoices match your current filters"
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
            {isAdmin && invoices.length > 0 && (
              <div className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                      Select All ({selectedInvoices.length}/{invoices.length})
                    </span>
                  </label>

                  {selectedInvoices.length > 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected ({selectedInvoices.length})
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
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  {invoices.map((invoice) => {
                    const isSelected = selectedInvoices.includes(invoice.invoiceNumber);
                    return (
                      <tr
                        key={invoice._id}
                        className={`hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleViewInvoice(invoice.invoiceNumber)}
                      >
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(invoice.invoiceNumber)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          #{invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {invoice.customer?.name || 'N/A'}
                        </div>
                        {invoice.assignedTo && (
                          <div className="text-xs text-slate-500 dark:text-gray-400">
                            Assigned: {invoice.assignedTo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(invoice.invoiceDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(invoice.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.stockProcessed ? (
                          <Badge variant="success">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice.invoiceNumber);
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

            {}
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

      {}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Delete Selected Invoices
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                      Warning: This action cannot be undone!
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      You are about to permanently delete <strong>{selectedInvoices.length}</strong> selected invoice{selectedInvoices.length !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">
                  Selected Invoices:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <ul className="space-y-1">
                    {selectedInvoices.map(invoiceNumber => {
                      const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
                      return (
                        <li key={invoiceNumber} className="text-sm text-slate-700 dark:text-gray-300">
                          <span className="font-semibold">#{invoiceNumber}</span>
                          {invoice && (
                            <>
                              <span className="text-slate-500 dark:text-gray-400 ml-2">
                                - {invoice.customer?.name || 'N/A'}
                              </span>
                              <span className="text-slate-500 dark:text-gray-400 ml-2">
                                ({formatCurrency(invoice.total)})
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
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
                    Delete Selected Invoices
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosedInvoices;
