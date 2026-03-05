import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import discrepancyService from '../../services/discrepancyService';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Plus,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

const DiscrepancyManagement = () => {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useContext(ToastContext);
  const location = useLocation();

  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState([]);
  const [filters, setFilters] = useState({
    status: '',  
    type: '',
    search: ''
  });
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [summary, setSummary] = useState(null);
  const [prefilledItem, setPrefilledItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discrepancyToDelete, setDiscrepancyToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  useEffect(() => {
    fetchDiscrepancies();
    fetchSummary();
  }, [filters, pagination.page]);
  useEffect(() => {
    if (location.state?.prefilledItem) {
      setPrefilledItem(location.state.prefilledItem);
      setShowRecordModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const fetchDiscrepancies = async () => {
    try {
      setLoading(true);
      const response = await discrepancyService.getDiscrepancies({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        type: filters.type,
      });
      if (response.success) {
        setDiscrepancies(response.data.discrepancies);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      showError?.('Failed to fetch discrepancies');
      console.error('Fetch discrepancies error:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSummary = async () => {
    try {
      const response = await discrepancyService.getSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Fetch summary error:', error);
    }
  };
  const handleApprove = async (discrepancyId) => {
    try {
      const response = await discrepancyService.approveDiscrepancy(discrepancyId, 'Approved from webapp');
      if (response.success) {
        showSuccess?.('Discrepancy approved successfully');
        fetchDiscrepancies();
        fetchSummary();
      } else {
        showError?.(response.message || 'Failed to approve discrepancy');
      }
    } catch (error) {
      showError?.('Error approving discrepancy');
      console.error('Approve error:', error);
    }
  };
  const handleReject = async (discrepancyId) => {
    try {
      const response = await discrepancyService.rejectDiscrepancy(discrepancyId, 'Rejected from webapp');
      if (response.success) {
        showSuccess?.('Discrepancy rejected successfully');
        fetchDiscrepancies();
        fetchSummary();
      } else {
        showError?.(response.message || 'Failed to reject discrepancy');
      }
    } catch (error) {
      showError?.('Error rejecting discrepancy');
      console.error('Reject error:', error);
    }
  };
  const handleDelete = async (discrepancyId) => {
    setDiscrepancyToDelete(discrepancyId);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!discrepancyToDelete) return;
    try {
      const response = await discrepancyService.deleteDiscrepancy(discrepancyToDelete);
      if (response.success) {
        showSuccess?.('Discrepancy deleted successfully');
        fetchDiscrepancies();
        fetchSummary();
      } else {
        showError?.(response.message || 'Failed to delete discrepancy');
      }
    } catch (error) {
      showError?.('Error deleting discrepancy');
      console.error('Delete error:', error);
    } finally {
      setShowDeleteModal(false);
      setDiscrepancyToDelete(null);
    }
  };
  const handleBulkApprove = async () => {
    if (selectedDiscrepancies.length === 0) {
      showError?.('Please select discrepancies to approve');
      return;
    }
    try {
      const response = await discrepancyService.bulkApproveDiscrepancies(
        selectedDiscrepancies,
        'Bulk approved from webapp'
      );
      if (response.success) {
        showSuccess?.(response.message);
        setSelectedDiscrepancies([]);
        fetchDiscrepancies();
        fetchSummary();
      } else {
        showError?.(response.message || 'Failed to bulk approve');
      }
    } catch (error) {
      showError?.('Error bulk approving discrepancies');
      console.error('Bulk approve error:', error);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'text-amber-700 bg-amber-100',
      'Approved': 'text-green-700 bg-green-100',
      'Rejected': 'text-red-700 bg-red-100',
      'Resolved': 'text-blue-700 bg-blue-100'
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };
  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Clock className="w-4 h-4" />,
      'Approved': <CheckCircle2 className="w-4 h-4" />,
      'Rejected': <XCircle className="w-4 h-4" />,
      'Resolved': <Package className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };
  const getTypeColor = (type) => {
    const colors = {
      'Overage': 'text-blue-700 bg-blue-50',
      'Shortage': 'text-red-700 bg-red-50',
      'Damage': 'text-orange-700 bg-orange-50',
      'Missing': 'text-purple-700 bg-purple-50'
    };
    return colors[type] || 'text-gray-700 bg-gray-50';
  };
  const filteredDiscrepancies = discrepancies.filter(d => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return d.itemName.toLowerCase().includes(search) ||
             d.invoiceNumber.toLowerCase().includes(search) ||
             (d.itemSku && d.itemSku.toLowerCase().includes(search));
    }
    return true;
  });
  if (loading && discrepancies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading discrepancies...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stock Discrepancies</h1>
            <p className="text-sm text-slate-600 mt-1">
              Record and manage inventory count differences
            </p>
          </div>
          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Record Discrepancy
          </button>
        </div>
      </div>
      {}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <h3 className="text-2xl font-bold text-slate-900">{summary.total || 0}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <Package className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
          {summary.byStatus?.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{item._id}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{item.count}</h3>
                </div>
                <div className={`p-3 rounded-lg ${getStatusColor(item._id)}`}>
                  {getStatusIcon(item._id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name, invoice, or SKU..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Resolved">Resolved</option>
          </select>
          {}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Overage">Overage</option>
            <option value="Shortage">Shortage</option>
            <option value="Damage">Damage</option>
            <option value="Missing">Missing</option>
          </select>
          {}
          {selectedDiscrepancies.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve ({selectedDiscrepancies.length})
            </button>
          )}
        </div>
      </div>
      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDiscrepancies.length === filteredDiscrepancies.filter(d => d.status === 'Pending').length && filteredDiscrepancies.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDiscrepancies(filteredDiscrepancies.filter(d => d.status === 'Pending').map(d => d._id));
                      } else {
                        setSelectedDiscrepancies([]);
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  System Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actual Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDiscrepancies.map((discrepancy) => (
                <React.Fragment key={discrepancy._id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDiscrepancies.includes(discrepancy._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDiscrepancies([...selectedDiscrepancies, discrepancy._id]);
                          } else {
                            setSelectedDiscrepancies(selectedDiscrepancies.filter(id => id !== discrepancy._id));
                          }
                        }}
                        disabled={discrepancy.status !== 'Pending'}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{discrepancy.invoiceNumber}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(discrepancy.reportedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{discrepancy.itemName}</div>
                      {discrepancy.itemSku && (
                        <div className="text-xs text-slate-500">{discrepancy.itemSku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{discrepancy.systemQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{discrepancy.actualQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${discrepancy.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {discrepancy.difference > 0 ? '+' : ''}{discrepancy.difference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(discrepancy.discrepancyType)}`}>
                        {discrepancy.discrepancyType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(discrepancy.status)}`}>
                        {getStatusIcon(discrepancy.status)}
                        {discrepancy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedRow(expandedRow === discrepancy._id ? null : discrepancy._id)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          {expandedRow === discrepancy._id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        {discrepancy.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(discrepancy._id)}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(discrepancy._id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {}
                        <button
                          onClick={() => handleDelete(discrepancy._id)}
                          className="p-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === discrepancy._id && (
                    <tr className="bg-slate-50">
                      <td colSpan="9" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Details</h4>
                            <dl className="space-y-2">
                              {discrepancy.reason && (
                                <>
                                  <dt className="text-xs text-slate-500">Reason:</dt>
                                  <dd className="text-sm text-slate-900">{discrepancy.reason}</dd>
                                </>
                              )}
                              {discrepancy.notes && (
                                <>
                                  <dt className="text-xs text-slate-500">Notes:</dt>
                                  <dd className="text-sm text-slate-900">{discrepancy.notes}</dd>
                                </>
                              )}
                              <dt className="text-xs text-slate-500">Reported By:</dt>
                              <dd className="text-sm text-slate-900">
                                {discrepancy.reportedBy?.fullName || discrepancy.reportedBy?.username || 'Unknown'}
                              </dd>
                            </dl>
                          </div>
                          {discrepancy.status !== 'Pending' && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Resolution</h4>
                              <dl className="space-y-2">
                                <dt className="text-xs text-slate-500">Resolved By:</dt>
                                <dd className="text-sm text-slate-900">
                                  {discrepancy.resolvedBy?.fullName || discrepancy.resolvedBy?.username || 'Unknown'}
                                </dd>
                                {discrepancy.resolvedAt && (
                                  <>
                                    <dt className="text-xs text-slate-500">Resolved At:</dt>
                                    <dd className="text-sm text-slate-900">
                                      {new Date(discrepancy.resolvedAt).toLocaleString()}
                                    </dd>
                                  </>
                                )}
                                {discrepancy.resolutionNotes && (
                                  <>
                                    <dt className="text-xs text-slate-500">Resolution Notes:</dt>
                                    <dd className="text-sm text-slate-900">{discrepancy.resolutionNotes}</dd>
                                  </>
                                )}
                              </dl>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {}
      {!loading && filteredDiscrepancies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Discrepancies Found</h3>
          <p className="text-slate-600 mb-6">
            {filters.status || filters.type || filters.search
              ? 'Try adjusting your filters'
              : 'Start recording stock discrepancies when you find differences during inventory checks'}
          </p>
          <button
            onClick={() => setShowRecordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Record First Discrepancy
          </button>
        </div>
      )}
      {}
      {showRecordModal && (
        <RecordDiscrepancyModal
          onClose={() => {
            setShowRecordModal(false);
            setPrefilledItem(null);
          }}
          onSuccess={() => {
            setShowRecordModal(false);
            setPrefilledItem(null);
            fetchDiscrepancies();
            fetchSummary();
          }}
          prefilledItem={prefilledItem}
        />
      )}
      {}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowDeleteModal(false);
            setDiscrepancyToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};
const RecordDiscrepancyModal = ({ onClose, onSuccess, prefilledItem }) => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceId: '',
    invoiceType: 'RouteStarInvoice',
    itemName: prefilledItem?.itemName || '',
    itemSku: prefilledItem?.itemSku || '',
    categoryName: prefilledItem?.categoryName || '',
    systemQuantity: 0,
    actualQuantity: 0,
    discrepancyType: '',
    reason: '',
    notes: prefilledItem ? `Reported from Stock Management for ${prefilledItem.categoryName}` : ''
  });
  const searchInvoices = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setInvoices([]);
      return;
    }
    try {
      setSearchingInvoice(true);
      const response = await discrepancyService.searchInvoices(searchTerm, 10);
      if (response.success) {
        setInvoices(response.data.invoices || []);
      }
    } catch (error) {
      console.error('Search invoices error:', error);
    } finally {
      setSearchingInvoice(false);
    }
  };
  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      ...formData,
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice._id,
      invoiceType: 'RouteStarInvoice',
      itemName: '',
      itemSku: '',
      systemQuantity: 0
    });
    setInvoices([]);
  };
  const handleLineItemSelect = (item) => {
    setFormData({
      ...formData,
      itemName: item.itemName,
      itemSku: item.itemCode || '',
      systemQuantity: item.quantity || 0
    });
  };
  useEffect(() => {
    if (formData.systemQuantity && formData.actualQuantity) {
      const diff = formData.actualQuantity - formData.systemQuantity;
      if (diff > 0 && !formData.discrepancyType) {
        setFormData(prev => ({ ...prev, discrepancyType: 'Overage' }));
      } else if (diff < 0 && !formData.discrepancyType) {
        setFormData(prev => ({ ...prev, discrepancyType: 'Shortage' }));
      }
    }
  }, [formData.systemQuantity, formData.actualQuantity]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prefilledItem && !formData.invoiceNumber) {
      showError?.('Please select an invoice');
      return;
    }
    if (!formData.itemName) {
      showError?.('Please select an item');
      return;
    }
    if (formData.actualQuantity === formData.systemQuantity) {
      showError?.('Actual quantity matches system quantity - no discrepancy to record');
      return;
    }
    if (!formData.discrepancyType) {
      showError?.('Please select a discrepancy type');
      return;
    }
    try {
      setLoading(true);
      const response = await discrepancyService.createDiscrepancy(formData);
      if (response.success) {
        showSuccess?.('Discrepancy recorded successfully');
        onSuccess();
      } else {
        showError?.(response.message || 'Failed to record discrepancy');
      }
    } catch (error) {
      showError?.('Error recording discrepancy');
      console.error('Record discrepancy error:', error);
    } finally {
      setLoading(false);
    }
  };
  const difference = formData.actualQuantity - formData.systemQuantity;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Record Stock Discrepancy</h2>
          <p className="text-sm text-slate-600 mt-1">Enter the details of the stock count difference</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {}
          {!prefilledItem && (
            <>
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invoice Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, invoiceNumber: e.target.value });
                      searchInvoices(e.target.value);
                    }}
                    placeholder="Search invoice by number..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {searchingInvoice && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Package className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
                {}
                {invoices.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {invoices.map((invoice) => (
                      <button
                        key={invoice._id}
                        type="button"
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                      >
                        <div className="font-medium text-slate-900">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-slate-500">
                          {invoice.customerName} • {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {}
              {selectedInvoice && selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Item *
                  </label>
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {selectedInvoice.lineItems.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLineItemSelect(item)}
                        className={`w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                          formData.itemName === item.itemName ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium text-slate-900">{item.itemName}</div>
                        <div className="text-xs text-slate-500">
                          SKU: {item.itemCode || 'N/A'} • Qty: {item.quantity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {}
          {prefilledItem && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Item Details</h3>
              <div className="space-y-1">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Item:</span> {prefilledItem.itemName}
                </div>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">SKU:</span> {prefilledItem.itemSku}
                </div>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Category:</span> {prefilledItem.categoryName}
                </div>
              </div>
            </div>
          )}
          {}
          {formData.itemName && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  System Quantity
                </label>
                <input
                  type="number"
                  value={formData.systemQuantity}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actual Quantity (Physical Count) *
                </label>
                <input
                  type="number"
                  value={formData.actualQuantity}
                  onChange={(e) => setFormData({ ...formData, actualQuantity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter actual counted quantity"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="1"
                />
              </div>
              {}
              {formData.actualQuantity !== 0 && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Difference:</span>
                    <span className={`text-lg font-bold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </span>
                  </div>
                </div>
              )}
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Discrepancy Type *
                </label>
                <select
                  value={formData.discrepancyType}
                  onChange={(e) => setFormData({ ...formData, discrepancyType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Overage">Overage (More than expected)</option>
                  <option value="Shortage">Shortage (Less than expected)</option>
                  <option value="Damage">Damage</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain the reason for this discrepancy..."
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </form>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.itemName || !formData.discrepancyType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Package className="w-5 h-5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Record Discrepancy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Discrepancy</h2>
          <p className="text-sm text-slate-600 text-center mb-6">
            Are you sure you want to delete this discrepancy? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DiscrepancyManagement;
