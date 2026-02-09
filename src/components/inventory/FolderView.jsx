import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Package, Eye, Download } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

/**
 * FolderView Component for CustomerConnect Orders
 * Groups items by item name/SKU and shows all order entries when expanded
 */
const FolderView = ({ items, isAdmin, onDeleteItem, getImageUrl }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});
  const [groupedItems, setGroupedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState({});

  // Fetch grouped items from CustomerConnect
  useEffect(() => {
    fetchGroupedItems();
  }, []);

  const fetchGroupedItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customerconnect/items/grouped');
      console.log('[FolderView] API response:', response);
      // Axios interceptor already unwraps response.data, so we access response.data.items directly
      const items = response.data?.items || [];
      console.log('[FolderView] Parsed items:', items.length, 'items');
      setGroupedItems(items);
    } catch (err) {
      console.error('Error fetching grouped items:', err);
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
    link.download = `purchase-items-${new Date().toISOString().split('T')[0]}.csv`;
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

  const getStockStatus = (stockProcessed) => {
    if (stockProcessed) {
      return { label: 'Processed', variant: 'success' };
    } else {
      return { label: 'Pending', variant: 'warning' };
    }
  };

  const getOrderStatusVariant = (status) => {
    const statusMap = {
      'Complete': 'success',
      'Shipped': 'info',
      'Processing': 'warning',
      'Pending': 'warning',
      'Cancelled': 'danger',
      'Denied': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading items..." />
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-900 font-semibold text-lg mb-2">No items to display</p>
        <p className="text-sm text-slate-500">
          Sync CustomerConnect orders to see items here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Download Button */}
      {groupedItems.length > 0 && (
        <div className="flex justify-end mb-4">
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
      )}

      {groupedItems.map((group) => {
        const isExpanded = expandedItems[group.sku];

        return (
          <div
            key={group.sku}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-200 hover:shadow-md transition-shadow"
          >
            {/* Item Folder Header */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => toggleItemFolder(group.sku)}
            >
              {/* Expand/Collapse Icon */}
              <button
                className="flex-shrink-0 p-1.5 hover:bg-blue-200 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItemFolder(group.sku);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Package Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Package className="w-7 h-7 text-blue-600" />
                </div>
              </div>

              {/* Item Name & Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-base">
                  {group.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  SKU: <span className="font-mono text-slate-700">{group.sku}</span>
                  <span className="mx-2">•</span>
                  <span className="text-slate-600">{group.orderCount} {group.orderCount === 1 ? 'order' : 'orders'}</span>
                </p>
              </div>

              {/* Aggregated Stats */}
              <div className="hidden lg:flex items-center gap-6 mr-2">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Ordered</p>
                  <p className="text-lg font-bold text-slate-900">
                    {group.totalQuantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Avg Price</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(group.avgUnitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Value</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(group.totalValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded: Show All Order Entries */}
            {isExpanded && (
              <div className="border-t border-blue-200 bg-blue-50">
                {group.orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No order entries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-100 border-b border-blue-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            PO Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Order Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Line Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                            Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-200 bg-white">
                        {group.orders.map((order, index) => {
                          const stockStatus = getStockStatus(order.stockProcessed);
                          return (
                            <tr
                              key={`${order.orderNumber}-${index}`}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-medium text-blue-600">
                                  {order.orderNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                  {order.poNumber || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700">
                                {formatFullDate(order.orderDate)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-medium text-slate-900">
                                  {order.vendor || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-base font-bold text-slate-900">
                                  {order.qty}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {formatCurrency(order.unitPrice)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-base font-semibold text-green-600">
                                  {formatCurrency(order.lineTotal)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={getOrderStatusVariant(order.status)} size="sm">
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={stockStatus.variant} size="sm">
                                  {stockStatus.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-blue-100 border-t-2 border-blue-300">
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-blue-700">
                            Totals:
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-base font-bold text-slate-900">
                              {group.orders.reduce((sum, order) => sum + order.qty, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-blue-700">
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
    </div>
  );
};

export default FolderView;
