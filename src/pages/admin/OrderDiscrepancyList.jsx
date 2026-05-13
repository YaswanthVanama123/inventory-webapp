import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import orderDiscrepancyService from '../../services/orderDiscrepancyService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  AlertTriangle, Search, ChevronDown, ChevronRight,
  Trash2, Package, User, Calendar, FileText, Hash
} from 'lucide-react';

const OrderDiscrepancyList = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
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
  }, [typeFilter, orderNumberFilter, pagination.page]);

  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
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

  const getTypeColor = (type) => {
    const colors = {
      'Shortage': 'text-orange-700 bg-orange-50',
      'Overage': 'text-blue-700 bg-blue-50',
      'Matched': 'text-green-700 bg-green-50'
    };
    return colors[type] || 'text-gray-700 bg-gray-50';
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Shortages</p>
            <p className="text-2xl font-bold text-orange-600">{stats.shortages}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Overages</p>
            <p className="text-2xl font-bold text-blue-600">{stats.overages}</p>
          </div>
        </div>
      )}

      {/* Filters & List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={orderNumberFilter}
                  onChange={(e) => {
                    setOrderNumberFilter(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Shortage">Shortage</option>
              <option value="Overage">Overage</option>
            </select>
            {(typeFilter || orderNumberFilter) && (
              <button
                onClick={() => {
                  setTypeFilter('');
                  setOrderNumberFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Discrepancy List */}
        <div className="divide-y divide-slate-100">
          {discrepancies.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Order Discrepancies</h3>
              <p className="text-slate-500">Discrepancies will appear here when orders are verified</p>
            </div>
          ) : (
            discrepancies.map((discrepancy) => {
              const isExpanded = expandedRow === discrepancy._id;
              return (
                <div key={discrepancy._id}>
                  {/* Row Header - Clickable */}
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : discrepancy._id)}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Expand Icon */}
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {discrepancy.itemName}
                        </span>
                        {discrepancy.sku && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {discrepancy.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-600">
                          Order #{discrepancy.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(discrepancy.reportedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quantities */}
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Expected</div>
                        <div className="font-medium text-slate-900">{discrepancy.expectedQuantity}</div>
                      </div>
                      <div className="text-slate-300">→</div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Received</div>
                        <div className="font-medium text-slate-900">{discrepancy.receivedQuantity}</div>
                      </div>
                      <div className={`font-bold text-sm min-w-[40px] text-center ${
                        discrepancy.discrepancyQuantity > 0 ? 'text-blue-600' : discrepancy.discrepancyQuantity < 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {discrepancy.discrepancyQuantity > 0 ? '+' : ''}{discrepancy.discrepancyQuantity}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(discrepancy.discrepancyType)}`}>
                      {discrepancy.discrepancyType}
                    </span>

                    {/* Delete */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(discrepancy)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-blue-50/30 border-t border-slate-100">
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Order & Item Details */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            Order Details
                          </h4>
                          <dl className="space-y-2.5">
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">Order #</dt>
                              <dd className="text-sm font-medium text-slate-900">{discrepancy.orderNumber}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">Item</dt>
                              <dd className="text-sm text-slate-900 text-right max-w-[180px] truncate">{discrepancy.itemName}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">SKU</dt>
                              <dd className="text-sm text-slate-900">{discrepancy.sku || 'N/A'}</dd>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <div className="text-xs text-slate-500">Expected</div>
                                  <div className="text-lg font-bold text-slate-900">{discrepancy.expectedQuantity}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Received</div>
                                  <div className="text-lg font-bold text-slate-900">{discrepancy.receivedQuantity}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Diff</div>
                                  <div className={`text-lg font-bold ${
                                    discrepancy.discrepancyQuantity > 0 ? 'text-blue-600' : discrepancy.discrepancyQuantity < 0 ? 'text-orange-600' : 'text-green-600'
                                  }`}>
                                    {discrepancy.discrepancyQuantity > 0 ? '+' : ''}{discrepancy.discrepancyQuantity}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </dl>
                        </div>

                        {/* Reporter & Timing */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            Reporter Info
                          </h4>
                          <dl className="space-y-2.5">
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">Reported By</dt>
                              <dd className="text-sm font-medium text-slate-900">
                                {discrepancy.reportedBy?.fullName || discrepancy.reportedBy?.username || 'N/A'}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">Date</dt>
                              <dd className="text-sm text-slate-900">
                                {formatDate(discrepancy.reportedAt)}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-xs text-slate-500">Type</dt>
                              <dd>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(discrepancy.discrepancyType)}`}>
                                  {discrepancy.discrepancyType}
                                </span>
                              </dd>
                            </div>
                            {discrepancy.resolvedBy && (
                              <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between">
                                  <dt className="text-xs text-slate-500">Resolved By</dt>
                                  <dd className="text-sm font-medium text-slate-900">
                                    {discrepancy.resolvedBy?.fullName || discrepancy.resolvedBy?.username}
                                  </dd>
                                </div>
                              </div>
                            )}
                          </dl>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-500" />
                            Notes
                          </h4>
                          <dl className="space-y-3">
                            {discrepancy.notes ? (
                              <div>
                                <dt className="text-xs text-slate-500 mb-1">Notes</dt>
                                <dd className="text-sm text-slate-900 bg-slate-50 rounded p-2">
                                  {discrepancy.notes}
                                </dd>
                              </div>
                            ) : (
                              <div>
                                <dt className="text-xs text-slate-500 mb-1">Notes</dt>
                                <dd className="text-sm text-slate-400 italic">No notes</dd>
                              </div>
                            )}
                            {discrepancy.resolutionNotes && (
                              <div>
                                <dt className="text-xs text-slate-500 mb-1">Resolution Notes</dt>
                                <dd className="text-sm text-slate-900 bg-green-50 rounded p-2 border border-green-200">
                                  {discrepancy.resolutionNotes}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Discrepancy</h2>
              {selectedDiscrepancy && (
                <div className="text-sm text-slate-600 text-center mb-4">
                  <p className="mb-2">Are you sure you want to delete this discrepancy?</p>
                  <div className="p-3 bg-slate-50 rounded-lg text-left">
                    <p><strong>Order:</strong> #{selectedDiscrepancy.orderNumber}</p>
                    <p><strong>Item:</strong> {selectedDiscrepancy.itemName}</p>
                    <p><strong>Difference:</strong> {selectedDiscrepancy.discrepancyQuantity > 0 ? '+' : ''}{selectedDiscrepancy.discrepancyQuantity}</p>
                  </div>
                  <p className="mt-2 text-xs text-red-600">This action cannot be undone.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setSelectedDiscrepancy(null); }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderDiscrepancyList;
