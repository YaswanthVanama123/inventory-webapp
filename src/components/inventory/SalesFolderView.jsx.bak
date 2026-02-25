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
  const [searchTerm, setSearchTerm] = useState('');

  
  useEffect(() => {
    fetchGroupedItems();
  }, []);

  const fetchGroupedItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/routestar/items/grouped');
      console.log('[SalesFolderView] API response:', response);
      
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
    
    const uniqueNames = groupedItems.map(item => {
      
      let cleanName = item.name || '';
      cleanName = cleanName.replace(/[\t\r\n,]/g, ' ');
      
      cleanName = cleanName.replace(/\s+/g, ' ').trim();
      return cleanName;
    });

    
    const csvContent = uniqueNames.join('\n');

    
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
    if (selectedItems.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.sku));
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

      await api.post('/routestar/invoices/bulk-delete', {
        skus: selectedItems
      });

      showSuccess(`Successfully deleted ${selectedItems.length} item(s)`);
      setDeleteModalOpen(false);
      setSelectedItems([]);


      fetchGroupedItems();
    } catch (err) {
      console.error('Error deleting items:', err);
      showError(err.message || 'Failed to delete items');
    } finally {
      setDeleting(false);
    }
  };

  // Filter items based on search term
  const filteredItems = groupedItems.filter(item => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search) ||
      item.originalNames?.some(name => name.toLowerCase().includes(search))
    );
  });

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
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or variation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-slate-500 mt-2">
            Found {filteredItems.length} of {groupedItems.length} items
          </p>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Distinct products
            </p>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                {filteredItems.reduce((sum, item) => sum + item.invoiceCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sales transactions
            </p>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Units Sold</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">
                {filteredItems.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total quantity sold
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(filteredItems.reduce((sum, item) => sum + item.totalValue, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sales value
            </p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Items with multiple name variations are automatically merged and displayed with their canonical names</span>
        </p>
      </div>

      {}
      {groupedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {}
            {isAdmin && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Select All ({selectedItems.length}/{filteredItems.length})
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

            {}
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

      {filteredItems.map((group) => {
        const isExpanded = expandedItems[group.sku];
        const isSelected = selectedItems.includes(group.sku);

        return (
          <div
            key={group.sku}
            className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 transition-all ${
              isSelected ? 'border-emerald-500 shadow-md' : 'border-emerald-200 hover:shadow-md'
            }`}
          >
            {}
            <div className="flex items-center gap-4 p-4">
              {}
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

              {}
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

              {}
              <div
                className="flex-shrink-0 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-emerald-600" />
                </div>
              </div>

              {}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate text-base">
                    {group.name}
                  </h3>
                  {group.originalNames && group.originalNames.length > 1 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {group.originalNames.length} merged
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  SKU: <span className="font-mono text-slate-700">{group.sku}</span>
                  <span className="mx-2">•</span>
                  <span className="text-slate-600">{group.invoiceCount} {group.invoiceCount === 1 ? 'invoice' : 'invoices'}</span>
                  {group.originalNames && group.originalNames.length > 1 && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-slate-400 text-xs" title={group.originalNames.join(', ')}>
                        Variations: {group.originalNames.slice(0, 2).join(', ')}
                        {group.originalNames.length > 2 && ` +${group.originalNames.length - 2} more`}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Mobile stats - visible on small screens */}
              <div className="lg:hidden w-full mt-3 grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded p-2 text-center">
                  <p className="text-xs text-slate-500 font-medium">Sold</p>
                  <p className="text-sm font-bold text-slate-900">{group.totalQuantity}</p>
                </div>
                <div className="bg-emerald-50 rounded p-2 text-center">
                  <p className="text-xs text-emerald-600 font-medium">Avg Price</p>
                  <p className="text-sm font-semibold text-emerald-700">{formatCurrency(group.avgUnitPrice)}</p>
                </div>
                <div className="bg-green-50 rounded p-2 text-center">
                  <p className="text-xs text-green-600 font-medium">Revenue</p>
                  <p className="text-sm font-bold text-green-700">{formatCurrency(group.totalValue)}</p>
                </div>
              </div>

              {/* Desktop stats - hidden on mobile */}
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

            {}
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

      {/* No results message */}
      {filteredItems.length === 0 && groupedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-900 font-semibold text-lg mb-2">No items found</p>
          <p className="text-sm text-slate-500">
            No items match your search "{searchTerm}". Try a different search term.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Clear search
          </button>
        </div>
      )}

      {}
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
