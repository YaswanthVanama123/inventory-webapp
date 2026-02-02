import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const InvoiceList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useContext(ToastContext);

  // State management
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('paymentStatus') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'date');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Fetch invoices whenever filters change
  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter, paymentStatusFilter, dateFrom, dateTo, currentPage, itemsPerPage]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (paymentStatusFilter) {
        params.paymentStatus = paymentStatusFilter;
      }

      if (dateFrom) {
        params.dateFrom = dateFrom;
      }

      if (dateTo) {
        params.dateTo = dateTo;
      }

      const response = await api.get('/invoices', { params });

      setInvoices(response.data.invoices || response.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.total || (response.data.invoices || response.data || []).length);
      setCurrentPage(response.data.currentPage || 1);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
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

  const handlePaymentStatusFilterChange = (e) => {
    setPaymentStatusFilter(e.target.value);
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
    setPaymentStatusFilter('');
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
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/new');
  };

  const handleView = (id) => {
    navigate(`/invoices/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/invoices/${id}/edit`);
  };

  const handleEmailClick = (invoice) => {
    setSelectedInvoice(invoice);
    setEmailAddress(invoice.customer?.email || '');
    setEmailMessage(`Please find attached invoice ${invoice.invoiceNumber}.`);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !selectedInvoice) return;

    setSendingEmail(true);
    try {
      await api.post(`/invoices/${selectedInvoice._id}/email`, {
        email: emailAddress,
        message: emailMessage,
      });

      showSuccess(`Invoice ${selectedInvoice.invoiceNumber} sent successfully to ${emailAddress}`);
      setEmailModalOpen(false);
      setEmailAddress('');
      setEmailMessage('');
      setSelectedInvoice(null);
    } catch (err) {
      console.error('Error sending email:', err);
      const errorMessage = err.message || 'Failed to send email';
      showError(errorMessage);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/invoices/${invoiceToDelete._id}`);
      showSuccess(`Successfully deleted invoice "${invoiceToDelete.invoiceNumber}"`);
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices(); // Refresh the list
    } catch (err) {
      console.error('Error deleting invoice:', err);
      showError(err.message || 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPDF = (id, invoiceNumber) => {
    try {
      // Open PDF in new tab
      const pdfUrl = `${api.defaults.baseURL}/invoices/${id}/pdf`;
      window.open(pdfUrl, '_blank');
      showInfo(`Downloading invoice ${invoiceNumber}`);
    } catch (err) {
      showError('Failed to download PDF');
    }
  };

  // Badge variant helpers
  const getStatusBadgeVariant = (status) => {
    const variants = {
      draft: 'default',
      issued: 'info',
      paid: 'success',
      cancelled: 'danger',
    };
    return variants[status?.toLowerCase()] || 'default';
  };

  const getPaymentStatusBadgeVariant = (paymentStatus) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      overdue: 'danger',
    };
    return variants[paymentStatus?.toLowerCase()] || 'default';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Payment status filter options
  const paymentStatusOptions = [
    { value: '', label: 'All Payment Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  // Check if filters are active
  const hasActiveFilters = searchTerm || statusFilter || paymentStatusFilter || dateFrom || dateTo;

  // Loading state
  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading invoices..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Invoices</h1>
            <p className="text-slate-600 mt-1">
              {totalItems} {totalItems === 1 ? 'invoice' : 'invoices'} found
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={handleCreateInvoice}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by invoice number or customer name..."
              fullWidth
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <Select
              name="status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              fullWidth
            />

            {/* Payment Status Filter */}
            <Select
              name="paymentStatus"
              value={paymentStatusFilter}
              onChange={handlePaymentStatusFilterChange}
              options={paymentStatusOptions}
              fullWidth
            />

            {/* Date From */}
            <Input
              type="date"
              name="dateFrom"
              value={dateFrom}
              onChange={handleDateFromChange}
              placeholder="From Date"
              fullWidth
            />

            {/* Date To */}
            <Input
              type="date"
              name="dateTo"
              value={dateTo}
              onChange={handleDateToChange}
              placeholder="To Date"
              fullWidth
            />
          </div>

          {/* Clear Filters & View Mode */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-1.5 rounded font-medium transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Table view"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`flex-1 px-3 py-1.5 rounded font-medium transition-all duration-200 ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Card view"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-slate-200">
          <LoadingSpinner size="lg" text="Loading..." className="mx-auto" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <EmptyState
            icon={
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No invoices found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters or search terms"
                : "Get started by creating your first invoice"
            }
            action={
              isAdmin && !hasActiveFilters && (
                <Button variant="primary" onClick={handleCreateInvoice}>
                  Create Your First Invoice
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Table View (Desktop) */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {invoice.customer?.name || invoice.customerName || 'N/A'}
                          </div>
                          {invoice.customer?.email && (
                            <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(invoice.date || invoice.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount || invoice.total)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>
                            {invoice.status || 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getPaymentStatusBadgeVariant(invoice.paymentStatus)}>
                            {invoice.paymentStatus || 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Button */}
                            <button
                              onClick={() => handleView(invoice._id)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>

                            {/* Download PDF Button */}
                            <button
                              onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                              className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50 transition-colors"
                              title="Download PDF"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>

                            {/* Email Button */}
                            <button
                              onClick={() => handleEmailClick(invoice)}
                              className="text-teal-600 hover:text-teal-800 p-1 rounded-lg hover:bg-teal-50 transition-colors"
                              title="Send Email"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>

                            {/* Edit Button (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() => handleEdit(invoice._id)}
                                className="text-orange-600 hover:text-orange-800 p-1 rounded-lg hover:bg-orange-50 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}

                            {/* Delete Button (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card View (Mobile-friendly) */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-lg font-semibold">
                        {invoice.invoiceNumber}
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(invoice.status)}
                        size="sm"
                        className="bg-white/20 text-white border border-white/30"
                      >
                        {invoice.status || 'Draft'}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Customer */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {invoice.customer?.name || invoice.customerName || 'N/A'}
                      </div>
                      {invoice.customer?.email && (
                        <div className="text-xs text-gray-500">{invoice.customer.email}</div>
                      )}
                    </div>

                    {/* Date & Amount */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</div>
                        <div className="text-sm text-gray-900">{formatDate(invoice.date || invoice.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(invoice.totalAmount || invoice.total)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Status</div>
                      <Badge variant={getPaymentStatusBadgeVariant(invoice.paymentStatus)} size="sm">
                        {invoice.paymentStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Left Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(invoice._id)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleEmailClick(invoice)}
                          className="text-teal-600 hover:text-teal-800 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                          title="Send Email"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Right Actions (Admin only) */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(invoice._id)}
                            className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 15, 25, 50]}
              showPageSize={true}
              showResultCount={true}
            />
          </div>
        </>
      )}

      {/* Email Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Send Invoice via Email"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEmailModalOpen(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendEmail}
              loading={sendingEmail}
              disabled={!emailAddress || sendingEmail}
            >
              Send Email
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Send invoice <span className="font-mono font-semibold">{selectedInvoice?.invoiceNumber}</span> to the customer via email.
            </p>
          </div>

          <Input
            type="email"
            name="email"
            label="Recipient Email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="customer@example.com"
            required
            fullWidth
          />

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Add a personal message..."
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setInvoiceToDelete(null);
          }
        }}
        title="Delete Invoice"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setInvoiceToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </>
        }
      >
        {invoiceToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
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
                  <p className="text-sm font-medium text-red-800">Warning: This action cannot be undone!</p>
                  <p className="text-sm text-red-700 mt-1">
                    The invoice will be permanently removed from the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the following invoice?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Invoice Number:</span>
                    <span className="text-sm font-semibold text-gray-900 font-mono">
                      {invoiceToDelete.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Customer:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {invoiceToDelete.customer?.name || invoiceToDelete.customerName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(invoiceToDelete.totalAmount || invoiceToDelete.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceList;
