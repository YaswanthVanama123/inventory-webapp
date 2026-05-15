import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Package, Eye, Download, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { ToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';


const FolderView = ({ items, isAdmin, onDeleteItem, getImageUrl, searchTerm = '', onFilteredCountChange }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});
  const [groupedItems, setGroupedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyingItems, setVerifyingItems] = useState({});
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [itemToVerify, setItemToVerify] = useState(null);
  const [receivedQuantity, setReceivedQuantity] = useState('');
  const [notes, setNotes] = useState('');
  useEffect(() => {
    fetchGroupedItems();
  }, [searchTerm]); 

  const fetchGroupedItems = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 1000 
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/customerconnect/items/grouped', { params });
      console.log('[FolderView] Full API response:', response);
      console.log('[FolderView] response.data:', response.data);
      console.log('[FolderView] response.data.data:', response.data?.data);
      const items = response.data?.data?.items || response.data?.items || [];
      console.log('[FolderView] Parsed items:', items.length, 'items', items);
      setGroupedItems(items);
    } catch (err) {
      console.error('Error fetching grouped items:', err);
      setGroupedItems([]);
    } finally {
      setLoading(false);
    }
  };
  const toggleItemFolder = async (sku) => {
    const isCurrentlyExpanded = expandedItems[sku];
    setExpandedItems(prev => ({
      ...prev,
      [sku]: !prev[sku]
    }));
    if (!isCurrentlyExpanded) {
      const item = groupedItems.find(i => i.sku === sku);
      if (!item.orders) {
        setLoadingOrders(prev => ({ ...prev, [sku]: true }));
        try {
          const response = await api.get(`/customerconnect/items/${encodeURIComponent(sku)}/orders`);
          console.log('[FolderView] Orders response for SKU', sku, ':', response);
          console.log('[FolderView] response.data:', response.data);
          console.log('[FolderView] response.data.data:', response.data?.data);
          const orders = response.data?.data?.entries || response.data?.entries || [];
          console.log('[FolderView] Extracted orders:', orders.length, 'orders', orders);
          setGroupedItems(prev => {
            const updated = prev.map(item => {
              if (item.sku === sku) {
                console.log('[FolderView] Updating item', sku, 'with', orders.length, 'orders');
                return { ...item, orders };
              }
              return item;
            });
            console.log('[FolderView] Updated groupedItems:', updated);
            return updated;
          });
        } catch (error) {
          console.error(`Error fetching orders for SKU ${sku}:`, error);
          showError('Failed to load order details');
          setGroupedItems(prev => prev.map(item =>
            item.sku === sku
              ? { ...item, orders: [] }
              : item
          ));
        } finally {
          setLoadingOrders(prev => ({ ...prev, [sku]: false }));
        }
      }
    }
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
      return { label: 'Pending', variant: 'info' };
    }
  };
  const getOrderStatusVariant = (status) => {
    const statusMap = {
      'Complete': 'success',
      'Shipped': 'info',
      'Processing': 'info',
      'Pending': 'info',
      'Cancelled': 'danger',
      'Denied': 'danger'
    };
    return statusMap[status] || 'secondary';
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
      await api.post('/customerconnect/orders/bulk-delete', {
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

  const handleVerifyItem = (order, sku) => {
    console.log('[FolderView] handleVerifyItem called with order:', order);
    console.log('[FolderView] order.qty:', order.qty);
    console.log('[FolderView] order.receivedQuantity:', order.receivedQuantity);
    console.log('[FolderView] order.verificationHistory:', order.verificationHistory);
    console.log('[FolderView] order.itemIndex:', order.itemIndex);

    const expectedQty = order.qty || 0;
    const previouslyReceived = order.receivedQuantity || 0;
    const remainingQty = Math.max(0, expectedQty - previouslyReceived);

    console.log('[FolderView] Calculated - expectedQty:', expectedQty, 'previouslyReceived:', previouslyReceived, 'remainingQty:', remainingQty);

    setItemToVerify({ order, itemIndex: order.itemIndex, sku });
    setReceivedQuantity(remainingQty.toString());
    setNotes('');
    setVerifyModalOpen(true);
  };

  const confirmVerifyItem = async () => {
    if (!itemToVerify) return;

    const { order, itemIndex, sku } = itemToVerify;
    const verifyKey = `${order.orderNumber}-${itemIndex}`;

    const receivedQty = parseFloat(receivedQuantity);
    if (isNaN(receivedQty) || receivedQty <= 0) {
      showError('Please enter a valid received quantity greater than 0');
      return;
    }

    try {
      setVerifyingItems(prev => ({ ...prev, [verifyKey]: true }));

      console.log('[FolderView] Sending verification request:', {
        orderNumber: order.orderNumber,
        itemIndex: itemIndex,
        sku: sku,
        receivedQty: receivedQty
      });

      const response = await api.post(
        `/customerconnect/orders/${order.orderNumber}/items/${itemIndex}/verify`,
        {
          userId: user?.id || user?._id,
          sku: sku,
          receivedQty: receivedQty,
          notes: notes.trim()
        }
      );

      const message = response.data?.message || 'Item verified successfully';
      showSuccess(message);

      console.log('[FolderView] Verification successful, refetching from database...');

      // Fetch fresh data from database
      const updatedOrders = await api.get(`/customerconnect/items/${encodeURIComponent(sku)}/orders`);
      const orders = updatedOrders.data?.data?.entries || updatedOrders.data?.entries || [];

      console.log('[FolderView] Refetched orders from DB:', orders);
      if (orders.length > 0) {
        console.log('[FolderView] First order data:', {
          orderNumber: orders[0].orderNumber,
          qty: orders[0].qty,
          receivedQuantity: orders[0].receivedQuantity,
          remainingQuantity: orders[0].remainingQuantity,
          verificationHistory: orders[0].verificationHistory
        });
      }

      // Update state with fresh database data
      setGroupedItems(prev => prev.map(item => {
        if (item.sku === sku) {
          console.log('[FolderView] Updating SKU', sku, 'with fresh data from DB');
          return { ...item, orders };
        }
        return item;
      }));

      setVerifyModalOpen(false);
      setItemToVerify(null);
      setReceivedQuantity('');
      setNotes('');
    } catch (error) {
      console.error('Error verifying item:', error);
      showError(error.response?.data?.message || 'Failed to verify item');
    } finally {
      setVerifyingItems(prev => {
        const newState = { ...prev };
        delete newState[verifyKey];
        return newState;
      });
    }
  };

  const filteredItems = groupedItems;

  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredItems.length, groupedItems.length);
    }
  }, [filteredItems.length, groupedItems.length, onFilteredCountChange]);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.sku));
    }
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
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
              isSelected ? 'border-indigo-400 shadow-lg' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
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
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              )}
              {}
              <button
                className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItemFolder(group.sku);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                )}
              </button>
              {}
              <div
                className="flex-shrink-0 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center border border-indigo-100">
                  <Package className="w-7 h-7 text-indigo-600" />
                </div>
              </div>
              {}
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
                  <span className="text-slate-600">{group.orderCount} {group.orderCount === 1 ? 'order' : 'orders'}</span>
                </p>
              </div>
              {}
              <div
                className="hidden lg:flex items-center gap-6 mr-2 cursor-pointer"
                onClick={() => toggleItemFolder(group.sku)}
              >
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Ordered</p>
                  <p className="text-lg font-bold text-slate-900">
                    {group.totalQuantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Avg Price</p>
                  <p className="text-lg font-semibold text-slate-700">
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
            {}
            {isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50">
                {loadingOrders[group.sku] ? (
                  <div className="p-8 text-center">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-slate-600 mt-3">Loading order details...</p>
                  </div>
                ) : !group.orders || group.orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No order entries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            PO Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Order Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Line Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Verification
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {group.orders.map((order, index) => {
                          const stockStatus = getStockStatus(order.stockProcessed);
                          const isItemVerified = order.itemVerified === true;
                          console.log(`[FolderView] Order ${order.orderNumber} - index ${index}:`, {
                            itemVerified: order.itemVerified,
                            isItemVerified: isItemVerified,
                            itemVerifiedAt: order.itemVerifiedAt,
                            stockProcessed: order.stockProcessed,
                            fullOrder: order
                          });
                          return (
                            <tr
                              key={`${order.orderNumber}-${index}`}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-medium text-indigo-600">
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
                              <td className="px-6 py-4">
                                {isItemVerified ? (
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="success" size="sm">Verified</Badge>
                                    <span className="text-xs text-slate-500">
                                      {formatFullDate(order.itemVerifiedAt)}
                                    </span>
                                    {order.itemVerifiedBy && (
                                      <span className="text-xs text-slate-500">
                                        by {order.itemVerifiedBy.username || order.itemVerifiedBy.name || 'N/A'}
                                      </span>
                                    )}
                                  </div>
                                ) : (order.receivedQuantity && order.receivedQuantity > 0) ? (
                                  <div className="flex flex-col gap-2">
                                    <Badge variant="info" size="sm">Partial ({order.receivedQuantity}/{order.qty})</Badge>
                                    {order.verificationHistory && order.verificationHistory.length > 0 && (
                                      <span className="text-xs text-blue-600">
                                        {order.verificationHistory.length} receipt(s)
                                      </span>
                                    )}
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleVerifyItem(order, group.sku)}
                                      disabled={verifyingItems[`${order.orderNumber}-${order.itemIndex}`]}
                                      className="whitespace-nowrap"
                                    >
                                      {verifyingItems[`${order.orderNumber}-${order.itemIndex}`] ? 'Verifying...' : 'Verify Remaining'}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleVerifyItem(order, group.sku)}
                                    disabled={verifyingItems[`${order.orderNumber}-${order.itemIndex}`]}
                                    className="whitespace-nowrap"
                                  >
                                    {verifyingItems[`${order.orderNumber}-${order.itemIndex}`] ? 'Verifying...' : 'Verify Item Arrival'}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                            Totals:
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-base font-bold text-slate-900">
                              {group.orders.reduce((sum, order) => sum + order.qty, 0)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-slate-700">
                            Avg: {formatCurrency(group.avgUnitPrice)}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-base font-semibold text-green-600">
                              {formatCurrency(group.totalValue)}
                            </span>
                          </td>
                          <td colSpan="3"></td>
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
      {filteredItems.length === 0 && groupedItems.length > 0 && searchTerm && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-900 font-semibold text-lg mb-2">No items found</p>
          <p className="text-sm text-slate-500">
            No items match "{searchTerm}". Try a different search term.
          </p>
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
                  All orders for the selected items will be permanently removed.
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
                      <span className="text-slate-600 ml-2">- {item?.orderCount || 0} orders</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* Verification Confirmation Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => {
          if (!verifyingItems[`${itemToVerify?.order?.orderNumber}-${itemToVerify?.itemIndex}`]) {
            setVerifyModalOpen(false);
            setItemToVerify(null);
            setReceivedQuantity('');
            setNotes('');
          }
        }}
        title="Verify Item Arrival"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setVerifyModalOpen(false);
                setItemToVerify(null);
                setReceivedQuantity('');
                setNotes('');
              }}
              disabled={verifyingItems[`${itemToVerify?.order?.orderNumber}-${itemToVerify?.itemIndex}`]}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmVerifyItem}
              loading={verifyingItems[`${itemToVerify?.order?.orderNumber}-${itemToVerify?.itemIndex}`]}
              disabled={verifyingItems[`${itemToVerify?.order?.orderNumber}-${itemToVerify?.itemIndex}`]}
            >
              Confirm Verification
            </Button>
          </>
        }
      >
        {itemToVerify && (() => {
          const expectedQty = itemToVerify.order.qty || 0;
          const previouslyReceived = itemToVerify.order.receivedQuantity || 0;
          const receivingNow = parseFloat(receivedQuantity) || 0;
          const remainingAfter = Math.max(0, expectedQty - previouslyReceived - receivingNow);
          const verificationHistory = itemToVerify.order.verificationHistory || [];

          console.log('[FolderView Modal] Rendering modal with data:', {
            expectedQty,
            previouslyReceived,
            receivingNow,
            remainingAfter,
            verificationHistoryLength: verificationHistory.length,
            verificationHistory,
            fullOrder: itemToVerify.order
          });

          return (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Confirm Item Arrival</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Enter the quantity received for this shipment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Item Details:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">SKU:</span>
                    <span className="text-sm font-semibold text-gray-900">{itemToVerify.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Item Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{itemToVerify.order.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Order Number:</span>
                    <span className="text-sm font-semibold text-gray-900">#{itemToVerify.order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Vendor:</span>
                    <span className="text-sm font-semibold text-gray-900">{itemToVerify.order.vendor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Unit Price:</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(itemToVerify.order.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Line Total:</span>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(itemToVerify.order.lineTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Order Date:</span>
                    <span className="text-sm font-semibold text-gray-900">{formatFullDate(itemToVerify.order.orderDate)}</span>
                  </div>
                </div>
              </div>

              {/* Verification History */}
              {verificationHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Previous Receipts:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Qty Received</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {verificationHistory.map((history, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm text-gray-900">{idx + 1}</td>
                            <td className="px-3 py-2 text-sm text-gray-700">
                              {history.verifiedAt ? formatFullDate(history.verifiedAt) : 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-sm font-bold text-blue-600 text-right">
                              {history.receivedQty || 0}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {history.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100">
                        <tr>
                          <td colSpan="2" className="px-3 py-2 text-sm font-semibold text-gray-700 text-right">
                            Total Received:
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-blue-600 text-right">
                            {previouslyReceived}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Quantity Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Quantity Information:</h4>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Ordered Quantity:</span>
                    <span className="text-lg font-bold text-gray-900">{expectedQty}</span>
                  </div>

                  {previouslyReceived > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Previously Received:</span>
                      <span className="text-lg font-bold text-blue-600">{previouslyReceived}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-blue-300">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How many did you receive now? *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={expectedQty - previouslyReceived}
                      step="1"
                      value={receivedQuantity}
                      onChange={(e) => setReceivedQuantity(e.target.value)}
                      className="w-full px-4 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter quantity received"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                    <span className="text-sm font-medium text-gray-700">Remaining After This:</span>
                    <span className={`text-lg font-bold ${
                      remainingAfter === 0
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      {remainingAfter}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any notes about this receipt..."
                />
              </div>

              {remainingAfter > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a partial receipt. You'll need to verify again when the remaining {remainingAfter} unit(s) arrive.
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
export default FolderView;
