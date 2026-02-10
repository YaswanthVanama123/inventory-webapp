import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, ShoppingCart, Download, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { ToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * SalesFolderView Component for RouteStar Invoice Items
 * Groups items by item name/SKU and shows all RouteStar invoice entries (pending and closed) when expanded
 */
const SalesFolderView = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);
  const [expandedItems, setExpandedItems] = useState({});
  const [groupedItems, setGroupedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch grouped items from RouteStar invoices (pending and closed)
  useEffect(() => {
    fetchGroupedItems();
  }, []);

  const fetchGroupedItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/routestar/items/grouped');
      console.log('[SalesFolderView] API response:', response);
      // Axios interceptor already unwraps response.data, so we access response.data.items directly
      const items = response.data?.items || [];
      console.log('[SalesFolderView] Parsed items:', items.length, 'items');
      setGroupedItems(items);
    } catch (err) {
      console.error('Error fetching grouped RouteStar invoice items:', err);
      setGroupedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemFolder = async (sku) => {
    setExpandedItems(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
  };

  const handleDownloadItemNames = () => {
    // Extract unique item names and clean them
    const uniqueNames = groupedItems.map(item => {
      // Get the name and replace any tabs, commas, or newlines with spaces
      let cleanName = item.name || '';
      cleanName = cleanName.replace(/[\t\r\n,]/g, ' ');
      // Remove multiple spaces
      cleanName = cleanName.replace(/\s+/g, ' ').trim();
      return cleanName;
    });

    // Create CSV content (just item names, one per line)
    const csvContent = uniqueNames.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-items-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatFullDate = (dateString) => {
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

  const getStatusVariant = (status) => {
    const statusMap = {
      'Completed': 'success',
      'Closed': 'success',
      'Pending': 'warning',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  const getInvoiceTypeVariant = (type) => {
    const typeMap = {
      'pending': 'warning',
      'closed': 'success'
    };
    return typeMap[type] || 'secondary';
  };

  const getStockStatusVariant = (processed) => {
    return processed ? 'success' : 'warning';
  };

  const handleCheckboxChange = (sku) => {
    setSelectedItems(prev => {
      if (prev.includes(sku)) {
        return prev.filter(item => item !== sku);
      } else {
        return [...prev, sku];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === groupedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(groupedItems.map(item => item.sku));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      showError('Please select items to delete');
      return;
    }
    setDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setDeleting(true);
    try {
      // Delete invoices by SKU
      await api.post('/routestar/invoices/bulk-delete', {
        skus: selectedItems
      });

      showSuccess(`Successfully deleted ${selectedItems.length} item(s)`);
      setDeleteModalOpen(false);
      setSelectedItems([]);

      // Refresh the list
      fetchGroupedItems();
    } catch (err) {
      console.error('Error deleting items:', err);
      showError(err.message || 'Failed to delete items');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading sales data..." />
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
        <ShoppingCart className="w-16 h-16 mx-auto text-emerald-300 mb-4" />
        <p className="text-slate-900 font-semibold text-lg mb-2">No sales recorded yet</p>
        <p className="text-sm text-slate-500">
          Sales will appear here once you sync RouteStar invoices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Action Toolbar */}
      {groupedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-emerald-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side: Select All Checkbox */}
            {isAdmin && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === groupedItems.length && groupedItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Select All ({selectedItems.length}/{groupedItems.length})
                  </span>
                </label>

                {selectedItems.length > 0 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedItems.length})
                  </Button>
                )}
              </div>
            )}

            {/* Right side: Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadItemNames}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Item Names
            </Button>
          </div>
        </div>
      )}

      {groupedItems.map((group) => {
        const isExpanded = expandedItems[group.sku];
        const isSelected = selectedItems.includes(group.sku);

        return (
          <div
            key={group.sku}
            className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 transition-all ${
              isSelected ? 'border-emerald-500 shadow-md' : 'border-emerald-200 hover:shadow-md'
            }`}
          >
            {/* Item Folder Header */}
            <div className="flex items-center gap-4 p-4">
              {/* Checkbox (Admin Only) */}
              {isAdmin && (
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(group.sku);
                    }}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Expand/Collapse Icon */}
              <button
                className="flex-shrink-0 p-1.5 hover:bg-emerald-200 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItemFolder(group.sku);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                )}
              </button>

              {/* Shopping Cart Icon */}
              <div
                className="flex-shrink-0 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-emerald-600" />
                </div>
              </div>

              {/* Item Name & Info */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <h3 className="font-semibold text-slate-900 truncate text-base">
                  {group.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  SKU: <span className="font-mono text-slate-700">{group.sku}</span>
                  <span className="mx-2">•</span>
                  <span className="text-slate-600">{group.invoiceCount} {group.invoiceCount === 1 ? 'invoice' : 'invoices'}</span>
                </p>
              </div>

              {/* Aggregated Stats */}
              <div
                className="hidden lg:flex items-center gap-6 mr-2 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Sold</p>
                  <p className="text-lg font-bold text-slate-900">
                    {group.totalQuantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Avg Price</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(group.avgUnitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Revenue</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(group.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded: Show All Invoice Entries */}
            {isExpanded && (
              <div className="border-t border-emerald-200 bg-emerald-50">
                {group.invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No invoice entries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-emerald-100 border-b border-emerald-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-200 bg-white">
                        {group.invoices.map((invoice, index) => {
                          return (
                            <tr
                              key={`${invoice.invoiceNumber}-${index}`}
                              className="hover:bg-emerald-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-medium text-emerald-600">
                                  {invoice.invoiceNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getInvoiceTypeVariant(invoice.invoiceType)} size="sm">
                                  {invoice.invoiceType || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700">
                                {formatFullDate(invoice.invoiceDate)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {invoice.customerName || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-base font-bold text-slate-900">
                                  {invoice.quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {formatCurrency(invoice.rate)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-base font-semibold text-green-600">
                                  {formatCurrency(invoice.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getStatusVariant(invoice.status)} size="sm">
                                  {invoice.status || 'N/A'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getStockStatusVariant(invoice.stockProcessed)} size="sm">
                                  {invoice.stockProcessed ? 'Processed' : 'Pending'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-emerald-100 border-t-2 border-emerald-300">
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-emerald-700">
                            Totals:
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-base font-bold text-slate-900">
                              {group.invoices.reduce((sum, inv) => sum + inv.quantity, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-emerald-700">
                            Avg: {formatCurrency(group.avgUnitPrice)}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-base font-semibold text-green-600">
                              {formatCurrency(group.totalValue)}
                            </span>
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
          }
        }}
        title="Delete Selected Items"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmBulkDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </>
        }
      >
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
                  All invoices for the selected items will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">
              You are about to delete {selectedItems.length} item(s):
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {selectedItems.map(sku => {
                  const item = groupedItems.find(i => i.sku === sku);
                  return (
                    <li key={sku} className="text-sm">
                      <span className="font-semibold text-slate-900">{item?.name || 'Unknown'}</span>
                      <span className="text-slate-500 ml-2">(SKU: {sku})</span>
                      <span className="text-slate-600 ml-2">- {item?.invoiceCount || 0} invoices</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesFolderView;
