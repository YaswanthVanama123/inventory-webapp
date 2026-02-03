import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  Package,
  ChevronRight,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Hash,
  Tag,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Plus,
  History,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Info,
} from 'lucide-react';

const Stock = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError, showInfo } = useContext(ToastContext);
  const tableRef = useRef(null);

  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [purchases, setPurchases] = useState({});
  const [sales, setSales] = useState({});
  const [loadingPurchases, setLoadingPurchases] = useState({});
  const [loadingSales, setLoadingSales] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);

  // Functions
  const fetchInventoryItems = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await api.get('/inventory');
      setItems(response.data.items || response.data || []);
      setLastRefresh(new Date());
      if (showRefreshIndicator) {
        showSuccess('Inventory data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      showError('Failed to load inventory items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchInventoryItems(true);
  };

  const toggleItemExpand = async (itemId) => {
    const isCurrentlyExpanded = expandedItems[itemId];

    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !isCurrentlyExpanded,
    }));

    // Fetch data when expanding - fetch both purchases and sales
    if (!isCurrentlyExpanded) {
      const purchasePromise = !purchases[itemId] ? fetchPurchasesForItem(itemId) : Promise.resolve();
      const salesPromise = !sales[itemId] ? fetchSalesForItem(itemId) : Promise.resolve();
      await Promise.all([purchasePromise, salesPromise]);
    }
  };

  const expandAll = async () => {
    const newExpandedState = {};
    filteredItems.forEach(item => {
      newExpandedState[item._id] = true;
    });
    setExpandedItems(newExpandedState);

    // Fetch data for all items
    filteredItems.forEach(item => {
      if (!purchases[item._id]) {
        fetchPurchasesForItem(item._id);
      }
      if (!sales[item._id]) {
        fetchSalesForItem(item._id);
      }
    });

    showInfo('Expanding all items...');
  };

  const collapseAll = () => {
    setExpandedItems({});
    showInfo('Collapsed all items');
  };

  const fetchPurchasesForItem = async (itemId) => {
    setLoadingPurchases((prev) => ({ ...prev, [itemId]: true }));
    try {
      const response = await api.get(`/inventory/${itemId}/purchases`);
      const purchaseData = response.data?.data?.purchases || response.data?.purchases || [];
      setPurchases((prev) => ({
        ...prev,
        [itemId]: purchaseData,
      }));
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showError('Failed to load purchase history');
      setPurchases((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingPurchases((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const fetchSalesForItem = async (itemId) => {
    setLoadingSales((prev) => ({ ...prev, [itemId]: true }));
    try {
      const response = await api.get(`/inventory/${itemId}/sales`);
      const salesData = response.data?.data?.sales || response.data?.sales || [];
      setSales((prev) => ({
        ...prev,
        [itemId]: salesData,
      }));
    } catch (error) {
      console.error('Error fetching sales:', error);
      showError('Failed to load sales history');
      setSales((prev) => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoadingSales((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Combine purchases and sales into a single array sorted by date (descending)
  const getCombinedEntries = (itemId) => {
    const purchaseList = purchases[itemId] || [];
    const salesList = sales[itemId] || [];

    // Map purchases to a common format
    const purchaseEntries = purchaseList.map(purchase => ({
      type: 'purchase',
      date: purchase.purchaseDate || purchase.date,
      quantity: purchase.quantity,
      remainingQuantity: purchase.remainingQuantity,
      price: purchase.purchasePrice || purchase.pricePerUnit || purchase.unitPrice || 0,
      totalCost: purchase.totalCost || (purchase.quantity * (purchase.purchasePrice || purchase.pricePerUnit || purchase.unitPrice || 0)),
      supplier: purchase.supplier?.name || purchase.supplier || purchase.supplierName,
      unit: purchase.unit,
      addedBy: purchase.createdBy?.username || purchase.createdBy?.name || purchase.addedBy || 'N/A',
      data: purchase,
    }));

    // Map sales to a common format
    const salesEntries = salesList.map(sale => ({
      type: 'sale',
      date: sale.date || sale.saleDate || sale.invoiceDate,
      quantity: sale.quantity,
      price: sale.price || sale.salePrice || sale.unitPrice || 0,
      total: sale.total || sale.subtotal || sale.totalAmount,
      customer: sale.customer?.name || sale.customer || sale.customerName || 'Walk-in Customer',
      invoiceNumber: sale.invoiceNumber,
      addedBy: sale.createdBy?.username || sale.createdBy?.name || sale.addedBy || 'N/A',
      data: sale,
    }));

    // Combine and sort by date (descending - newest first)
    const combined = [...purchaseEntries, ...salesEntries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order
    });

    return combined;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    if (imagePath.startsWith('/uploads')) {
      return `${backendUrl}${imagePath}`;
    }
    return imagePath;
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    try {
      const headers = ['Item Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Unit', 'Status'];
      const csvData = sortedItems.map(item => {
        const currentStock = item.currentStock ?? item.quantity ?? 0;
        const minStock = item.minStock ?? item.minStockLevel ?? item.lowStockThreshold ?? 10;
        const stockStatus = getStockStatus(currentStock, minStock);

        return [
          item.name || '',
          item.skuCode || item.sku || '',
          item.category || 'Uncategorized',
          currentStock,
          minStock,
          item.unit || 'units',
          stockStatus.label
        ];
      });

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `stock-inventory-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Stock data exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showError('Failed to export data');
    }
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = (items) => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'sku':
          aValue = (a.skuCode || a.sku || '').toLowerCase();
          bValue = (b.skuCode || b.sku || '').toLowerCase();
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'currentStock':
          aValue = a.currentStock ?? a.quantity ?? 0;
          bValue = b.currentStock ?? b.quantity ?? 0;
          break;
        case 'minStock':
          aValue = a.minStock ?? a.minStockLevel ?? a.lowStockThreshold ?? 10;
          bValue = b.minStock ?? b.minStockLevel ?? b.lowStockThreshold ?? 10;
          break;
        case 'status':
          const statusA = getStockStatus(
            a.currentStock ?? a.quantity ?? 0,
            a.minStock ?? a.minStockLevel ?? a.lowStockThreshold ?? 10
          );
          const statusB = getStockStatus(
            b.currentStock ?? b.quantity ?? 0,
            b.minStock ?? b.minStockLevel ?? b.lowStockThreshold ?? 10
          );
          aValue = statusA.label;
          bValue = statusB.label;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;

        {/* Summary Dashboard - Metrics Cards */}
        {!loading && items.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

              {/* Card 1: Total Items */}
              <div className="group relative bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg border border-blue-700 group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Items</p>
                    <p className="text-3xl font-bold text-slate-900">{metrics.totalItems}</p>
                    <p className="text-xs text-slate-500 mt-2">Inventory items tracked</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Stock Value */}
              <div className="group relative bg-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg border border-green-700 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Stock Value</p>
                    <p className="text-3xl font-bold text-slate-900">${metrics.totalStockValue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-2">Total inventory worth</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Low Stock Items */}
              <div className="group relative bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg border border-amber-700 group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Low Stock Items</p>
                    <p className="text-3xl font-bold text-amber-600">{metrics.lowStockCount}</p>
                    <p className="text-xs text-slate-500 mt-2">Items below threshold</p>
                  </div>
                </div>
              </div>

              {/* Card 4: Out of Stock */}
              <div className="group relative bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-50"></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg border border-red-700 group-hover:scale-110 transition-transform duration-300">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Out of Stock</p>
                    <p className="text-3xl font-bold text-red-600">{metrics.outOfStockCount}</p>
                    <p className="text-xs text-slate-500 mt-2">Items with zero quantity</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      return 0;
    });
  };

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.skuCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting
  const sortedItems = getSortedItems(filteredItems);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev =>
            Math.min(prev + 1, sortedItems.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedRowIndex >= 0 && sortedItems[focusedRowIndex]) {
            toggleItemExpand(sortedItems[focusedRowIndex]._id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          collapseAll();
          setFocusedRowIndex(-1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRowIndex, sortedItems]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tbody tr[data-row-index]');
      if (rows[focusedRowIndex]) {
        rows[focusedRowIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedRowIndex]);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Get stock status with color coding
  const getStockStatus = (currentStock, minStock) => {
    if (currentStock <= 0) {
      return {
        label: 'Out of Stock',
        variant: 'danger',
        color: 'text-red-600',
        tooltip: 'Stock depleted - requires immediate restocking',
        icon: XCircle,
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300'
      };
    }
    if (currentStock <= minStock) {
      return {
        label: 'Low Stock',
        variant: 'warning',
        color: 'text-amber-600',
        tooltip: `Stock level is at or below minimum threshold of ${minStock} units`,
        icon: AlertCircle,
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-300'
      };
    }
    return {
      label: 'In Stock',
      variant: 'success',
      color: 'text-green-600',
      tooltip: 'Stock levels are healthy',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    };
  };

  // Quick action handlers
  const handleViewDetails = (itemId) => {
    navigate(`/inventory/${itemId}`);
  };

  const handleAddPurchase = (itemId) => {
    navigate(`/purchases/new?itemId=${itemId}`);
  };

  const handleViewHistory = (itemId) => {
    toggleItemExpand(itemId);
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  const SortableHeader = ({ column, label, className = "" }) => (
    <th
      scope="col"
      className={`px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors ${className}`}
      onClick={() => handleSort(column)}
      title={`Click to sort by ${label}`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sortConfig.key === column && (
          <span className="text-blue-600">
            {sortConfig.direction === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        )}
      </div>
    </th>
  );

  const QuickActionsMenu = ({ item, onClose }) => {
    const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

    return (
      <div className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-lg border-2 border-slate-300 py-1 z-50 animate-fadeIn">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(item._id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
          title="View detailed information about this item"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          View Details
        </button>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddPurchase(item._id);
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-green-50 flex items-center gap-2 transition-colors"
            title="Add a new purchase for this item (Admin only)"
          >
            <Plus className="w-4 h-4 text-green-600" />
            Add Purchase
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewHistory(item._id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
          title="Expand to view purchase and sales history"
        >
          <History className="w-4 h-4 text-indigo-600" />
          View History
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl border border-blue-700">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Stock Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor inventory levels and track stock movements</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
                title="Refresh inventory data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={sortedItems.length === 0}
                className="flex items-center gap-2"
                title="Export current view to CSV file"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Last Refresh Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <Info className="w-3 h-3" />
            <span>Last updated: {formatDate(lastRefresh)} at {formatTime(lastRefresh)}</span>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <span className="font-semibold">Keyboard shortcuts:</span>{' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-300 font-mono">↑↓</kbd> Navigate rows,{' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-300 font-mono">Enter</kbd> Expand/Collapse,{' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-blue-300 font-mono">Esc</kbd> Collapse all
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or category..."
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedItems.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8">
            <EmptyState
              icon={<Package className="w-20 h-20 text-slate-300" />}
              title={searchTerm ? "No items match your search" : "No inventory items found"}
              description={searchTerm ? "Try adjusting your search terms" : "Start by adding items to your inventory"}
            />
          </div>
        )}

        {/* Items Table Container */}
        {!loading && sortedItems.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
            {/* Table Actions Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{sortedItems.length}</span> items
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandAll}
                  className="flex items-center gap-2"
                  title="Expand all item details to show purchase and sales history"
                >
                  <ChevronsDown className="w-4 h-4" />
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  className="flex items-center gap-2"
                  title="Collapse all expanded item details"
                >
                  <ChevronsUp className="w-4 h-4" />
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Mobile Scroll Hint */}
            <div className="block sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs text-slate-600 text-center border-b border-slate-200">
              Swipe left to see more
            </div>

            {/* Table Wrapper with Horizontal Scroll */}
            <div className="overflow-x-auto" ref={tableRef}>
              <table className="min-w-full divide-y divide-slate-200">
                {/* Sticky Table Header */}
                <thead className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="w-12 px-4 py-4 text-left">
                      <span className="sr-only">Expand</span>
                    </th>
                    <SortableHeader column="name" label="Item" />
                    <SortableHeader column="sku" label="SKU" />
                    <SortableHeader column="category" label="Category" />
                    <SortableHeader column="currentStock" label="Current Stock" className="text-center" />
                    <SortableHeader column="minStock" label="Min Stock" className="text-center" />
                    <SortableHeader column="status" label="Status" className="text-center" />
                    <th scope="col" className="w-16 px-4 py-4 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-slate-200">
                  {sortedItems.map((item, index) => {
                    const currentStock = item.currentStock ?? item.quantity ?? 0;
                    const minStock = item.minStock ?? item.minStockLevel ?? item.lowStockThreshold ?? 10;
                    const stockStatus = getStockStatus(currentStock, minStock);
                    const isExpanded = expandedItems[item._id];
                    const isFocused = focusedRowIndex === index;
                    const isHovered = hoveredRow === item._id;

                    return (
                      <React.Fragment key={item._id}>
                        {/* Main Item Row with Zebra Striping */}
                        <tr
                          data-row-index={index}
                          onMouseEnter={() => setHoveredRow(item._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => setFocusedRowIndex(index)}
                          className={`
                            transition-all duration-200 group
                            ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                            hover:bg-blue-50/50
                            ${isExpanded ? 'bg-blue-50/30' : ''}
                            ${isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''}
                          `}
                        >
                          {/* Expand Button */}
                          <td className="px-4 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItemExpand(item._id);
                              }}
                              disabled={loadingPurchases[item._id] || loadingSales[item._id]}
                              className="group p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                              aria-expanded={isExpanded}
                              title={isExpanded ? "Collapse details" : "Expand to view purchase & sales history"}
                            >
                              <ChevronRight
                                className={`
                                  w-5 h-5 text-slate-400 group-hover:text-blue-600
                                  transition-all duration-300 ease-out
                                  ${isExpanded ? 'rotate-90 text-blue-600' : 'rotate-0'}
                                  ${(loadingPurchases[item._id] || loadingSales[item._id]) ? 'animate-pulse' : ''}
                                `}
                              />
                            </button>
                          </td>

                          {/* Item with Image */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-14 w-14">
                                {item.image ? (
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-slate-200"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/56?text=No+Image';
                                    }}
                                    title={item.name}
                                  />
                                ) : (
                                  <div
                                    className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-2 ring-slate-200"
                                    title="No image available"
                                  >
                                    <Package className="w-7 h-7 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 max-w-xs">
                                <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-slate-500 truncate mt-0.5" title={item.description}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* SKU Code */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="text-sm text-slate-700 font-mono bg-slate-100 px-3 py-1 rounded-md inline-flex items-center gap-1"
                              title="Stock Keeping Unit identifier"
                            >
                              <Hash className="w-3 h-3 text-slate-400" />
                              {item.skuCode || item.sku || 'N/A'}
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="info"
                              className="text-xs inline-flex items-center gap-1"
                              title="Item category classification"
                            >
                              <Tag className="w-3 h-3" />
                              {item.category || 'Uncategorized'}
                            </Badge>
                          </td>

                          {/* Current Stock */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div
                              className="text-lg font-bold text-slate-900"
                              title={`Current stock level: ${currentStock} ${item.unit || 'units'}`}
                            >
                              {currentStock}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {item.unit || 'units'}
                            </div>
                          </td>

                          {/* Min Stock */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div
                              className="text-sm font-medium text-slate-600"
                              title={`Minimum stock threshold: ${minStock} ${item.unit || 'units'}`}
                            >
                              {minStock}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {item.unit || 'units'}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div title={stockStatus.tooltip}>
                              <Badge variant={stockStatus.variant} className="text-xs font-semibold">
                                {stockStatus.label}
                              </Badge>
                            </div>
                            {currentStock <= minStock && currentStock > 0 && (
                              <div
                                className="flex items-center justify-center gap-1 mt-1"
                                title="Stock level is below minimum threshold - reorder recommended"
                              >
                                <TrendingDown className="w-3 h-3 text-amber-500" />
                                <span className="text-xs text-amber-600">Alert</span>
                              </div>
                            )}
                            {currentStock <= 0 && (
                              <div
                                className="flex items-center justify-center gap-1 mt-1"
                                title="Critical: Stock completely depleted - immediate action required"
                              >
                                <TrendingDown className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600">Critical</span>
                              </div>
                            )}
                          </td>

                          {/* Quick Actions Menu */}
                          <td className="px-4 py-4 whitespace-nowrap text-center relative">
                            <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu(activeMenu === item._id ? null : item._id);
                                }}
                                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Quick actions menu - View details, add purchase, or view history"
                              >
                                <MoreVertical className="w-4 h-4 text-slate-600" />
                              </button>
                              {activeMenu === item._id && (
                                <QuickActionsMenu
                                  item={item}
                                  onClose={() => setActiveMenu(null)}
                                />
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Section: Combined Entries (Purchases & Sales) */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="8" className="px-6 py-4 bg-slate-50">
                              {(loadingPurchases[item._id] || loadingSales[item._id]) ? (
                                <div className="text-center py-4">
                                  <LoadingSpinner size="sm" text="Loading entries..." />
                                </div>
                              ) : (() => {
                                const combinedEntries = getCombinedEntries(item._id);
                                return combinedEntries.length > 0 ? (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Transaction History (All Entries)</h4>
                                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                      <table className="min-w-full">
                                        <thead className="bg-slate-100">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Quantity</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Price/Unit</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Total</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Party</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Added By</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Details</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                          {combinedEntries.map((entry, idx) => (
                                            <tr key={`${entry.type}-${idx}`} className="hover:bg-slate-50">
                                              <td className="px-4 py-3 text-sm">
                                                <Badge variant={entry.type === 'purchase' ? 'info' : 'success'} className="text-xs">
                                                  {entry.type === 'purchase' ? (
                                                    <span className="flex items-center gap-1">
                                                      <TrendingUp className="w-3 h-3" />
                                                      Purchase
                                                    </span>
                                                  ) : (
                                                    <span className="flex items-center gap-1">
                                                      <TrendingDown className="w-3 h-3" />
                                                      Sale
                                                    </span>
                                                  )}
                                                </Badge>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-700">{formatDate(entry.date)}</td>
                                              <td className="px-4 py-3 text-sm text-slate-700">
                                                {entry.quantity} {entry.unit || item.unit}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-700">
                                                ${entry.price.toFixed(2)}
                                              </td>
                                              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                                ${entry.type === 'purchase'
                                                  ? entry.totalCost.toFixed(2)
                                                  : (entry.total || (entry.quantity * entry.price)).toFixed(2)
                                                }
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-700">
                                                {entry.type === 'purchase' ? entry.supplier : entry.customer}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-700">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs">
                                                  <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                  </svg>
                                                  {entry.addedBy}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-sm">
                                                {entry.type === 'purchase' ? (
                                                  <span className={`font-semibold ${(entry.remainingQuantity ?? entry.quantity) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    Remaining: {entry.remainingQuantity ?? entry.quantity} {entry.unit || item.unit}
                                                  </span>
                                                ) : (
                                                  entry.invoiceNumber && (
                                                    <span className="text-xs text-slate-600">
                                                      Invoice: {entry.invoiceNumber}
                                                    </span>
                                                  )
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-slate-500">
                                    No transactions recorded yet.
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles for Animations and Scrollbar */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }

        /* Ensure table is accessible on mobile */
        @media (max-width: 640px) {
          table {
            min-width: 800px;
          }
        }

        /* Keyboard shortcut styling */
        kbd {
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Stock;
