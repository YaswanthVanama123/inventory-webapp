import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import orderDiscrepancyService from '../../services/orderDiscrepancyService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const OrderDiscrepancyList = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [orderNumberFilter, setOrderNumberFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDiscrepancies();
    fetchStats();
  }, [statusFilter, typeFilter, orderNumberFilter, pagination.page]);

  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.discrepancyType = typeFilter;
      if (orderNumberFilter.trim()) params.orderNumber = orderNumberFilter.trim();
      const response = await orderDiscrepancyService.getOrderDiscrepancies(params);
      if (response.success) {
        setDiscrepancies(response.data.discrepancies);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch order discrepancies error:', error);
      showError('Failed to load order discrepancies');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await orderDiscrepancyService.getOrderDiscrepancyStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleDelete = (discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDiscrepancy) return;
    try {
      setActionLoading(true);
      const response = await orderDiscrepancyService.deleteOrderDiscrepancy(selectedDiscrepancy._id);
      if (response.success) {
        showSuccess('Order discrepancy deleted successfully');
        setShowDeleteModal(false);
        setSelectedDiscrepancy(null);
        fetchDiscrepancies();
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showError(error.response?.data?.message || 'Failed to delete discrepancy');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'warning', label: 'Pending', icon: ClockIcon },
      approved: { variant: 'success', label: 'Approved', icon: CheckCircleIcon },
      rejected: { variant: 'danger', label: 'Rejected', icon: XCircleIcon }
    };
    const { variant, label, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant={variant}>
        <Icon className="w-4 h-4 mr-1" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const config = {
      Shortage: { variant: 'warning', label: 'Shortage' },
      Overage: { variant: 'info', label: 'Overage' },
      Matched: { variant: 'success', label: 'Matched' }
    };
    const { variant, label } = config[type] || { variant: 'default', label: type };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && discrepancies.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card variant="elevated" padding="sm">
            <div className="text-center py-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </Card>
          <Card variant="elevated" padding="sm">
            <div className="text-center py-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
          </Card>
          <Card variant="elevated" padding="sm">
            <div className="text-center py-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Shortages</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.shortages}</p>
            </div>
          </Card>
          <Card variant="elevated" padding="sm">
            <div className="text-center py-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Overages</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.overages}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-6">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">All Types</option>
              <option value="Shortage">Shortage</option>
              <option value="Overage">Overage</option>
              <option value="Matched">Matched</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Number
            </label>
            <Input
              value={orderNumberFilter}
              onChange={(e) => {
                setOrderNumberFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              placeholder="Filter by order number"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
                setOrderNumberFilter('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card variant="elevated" padding="none">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Discrepancies ({pagination.total} records)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Expected
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {discrepancies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No order discrepancies found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Discrepancies will appear here when orders are verified</p>
                    </div>
                  </td>
                </tr>
              ) : (
                discrepancies.map((discrepancy) => (
                  <React.Fragment key={discrepancy._id}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === discrepancy._id ? null : discrepancy._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {discrepancy.orderNumber}
                        </div>
                        {discrepancy.orderId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(discrepancy.orderId.orderDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {discrepancy.itemName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {discrepancy.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                        {discrepancy.expectedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {discrepancy.receivedQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold ${
                          discrepancy.discrepancyQuantity > 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : discrepancy.discrepancyQuantity < 0
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {discrepancy.discrepancyQuantity > 0 ? '+' : ''}{discrepancy.discrepancyQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(discrepancy.discrepancyType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {discrepancy.reportedBy?.fullName || discrepancy.reportedBy?.username || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(discrepancy.reportedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(discrepancy)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                    {/* Expanded row */}
                    {expandedRow === discrepancy._id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                          <div className="grid grid-cols-2 gap-4">
                            {discrepancy.notes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{discrepancy.notes}</p>
                              </div>
                            )}
                            {discrepancy.resolvedBy && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolved By:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {discrepancy.resolvedBy.fullName || discrepancy.resolvedBy.username}
                                  <br />
                                  <span className="text-xs">{formatDate(discrepancy.resolvedAt)}</span>
                                </p>
                              </div>
                            )}
                            {discrepancy.resolutionNotes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolution Notes:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{discrepancy.resolutionNotes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !actionLoading && setShowDeleteModal(false)}
        title="Delete Order Discrepancy"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={actionLoading}
            >
              Delete
            </Button>
          </>
        }
      >
        {selectedDiscrepancy && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>Are you sure you want to delete this discrepancy?</p>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p><strong>Order:</strong> {selectedDiscrepancy.orderNumber}</p>
              <p><strong>Item:</strong> {selectedDiscrepancy.itemName}</p>
              <p><strong>Difference:</strong> {selectedDiscrepancy.discrepancyQuantity > 0 ? '+' : ''}{selectedDiscrepancy.discrepancyQuantity}</p>
            </div>
            <p className="mt-3 text-red-600 text-xs">This action cannot be undone.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default OrderDiscrepancyList;
