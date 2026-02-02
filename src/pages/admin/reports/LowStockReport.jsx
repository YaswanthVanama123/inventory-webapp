import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Search,
  Download,
  Mail,
  ShoppingCart,
  RefreshCw,
  Filter,
  X,
  Phone,
  MapPin,
  Clock,
  TrendingDown,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';


const PRIORITY_COLORS = {
  High: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  Medium: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  Low: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
};


const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Summary Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconColor, loading }) => {
  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
      {priority}
    </span>
  );
};


const ItemCard = ({ item, onEmailSupplier, onCreateOrder }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low;

  return (
    <Card className={`p-4 border-l-4 ${colors.border.replace('border-', 'border-l-')}`}>
      <div className="space-y-3">
        {}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {item.itemName}
            </h3>
            <p className="text-sm text-gray-500">SKU: {item.skuCode}</p>
          </div>
          <PriorityBadge priority={item.priority} />
        </div>

        {/* Stock Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Stock</p>
            <p className="text-lg font-semibold text-gray-900">
              {item.currentStock} {item.unit}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Minimum Stock</p>
            <p className="text-lg font-semibold text-gray-900">
              {item.minimumStock} {item.unit}
            </p>
          </div>
        </div>

        {}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Supplier:</span>
            <span className="font-medium text-gray-900">{item.supplier.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Suggested Order:</span>
            <span className="font-medium text-gray-900">
              {item.suggestedOrderQuantity} {item.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Order Cost:</span>
            <span className="font-semibold text-blue-600">
              ${item.orderCost.toFixed(2)}
            </span>
          </div>
        </div>

        {}
        {item.supplier.email && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>{expanded ? 'Hide' : 'Show'} Supplier Details</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {expanded && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {item.supplier.contactPerson && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500">Contact:</span>
                <span className="text-gray-900">{item.supplier.contactPerson}</span>
              </div>
            )}
            {item.supplier.email && (
              <div className="flex items-start gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <a
                  href={`mailto:${item.supplier.email}`}
                  className="text-blue-600 hover:underline break-all"
                >
                  {item.supplier.email}
                </a>
              </div>
            )}
            {item.supplier.phone && (
              <div className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <a
                  href={`tel:${item.supplier.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.supplier.phone}
                </a>
              </div>
            )}
            {item.supplier.leadTime && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-900">{item.supplier.leadTime} days lead time</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEmailSupplier(item)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => onCreateOrder(item)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Order
          </button>
        </div>
      </div>
    </Card>
  );
};


const LowStockReport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  
  const fetchLowStockReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/reports/low-stock');

      if (response.success) {
        setData(response.data);
        setFilteredItems(response.data.items);

        
        const uniqueCategories = [...new Set(response.data.items.map(item => item.category))];
        const uniqueSuppliers = [...new Set(response.data.items.map(item => item.supplier.name))];

        setCategories(uniqueCategories.sort());
        setSuppliers(uniqueSuppliers.sort());
      }
    } catch (err) {
      console.error('Error fetching low stock report:', err);
      setError(err.message || 'Failed to load low stock report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockReport();
  }, []);

  
  useEffect(() => {
    if (!data) return;

    let filtered = [...data.items];

    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.itemName.toLowerCase().includes(query) ||
          item.skuCode.toLowerCase().includes(query) ||
          item.supplier.name.toLowerCase().includes(query)
      );
    }

    
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    
    if (priorityFilter) {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    
    if (supplierFilter) {
      filtered = filtered.filter(item => item.supplier.name === supplierFilter);
    }

    setFilteredItems(filtered);
  }, [searchQuery, categoryFilter, priorityFilter, supplierFilter, data]);

  
  const handleEmailSupplier = (item) => {
    const subject = encodeURIComponent(`Reorder Request: ${item.itemName}`);
    const body = encodeURIComponent(
      `Dear ${item.supplier.contactPerson || item.supplier.name},\n\n` +
      `We would like to place an order for the following item:\n\n` +
      `Item: ${item.itemName}\n` +
      `SKU: ${item.skuCode}\n` +
      `Quantity: ${item.suggestedOrderQuantity} ${item.unit}\n` +
      `Estimated Cost: $${item.orderCost.toFixed(2)}\n\n` +
      `Please confirm availability and delivery timeline.\n\n` +
      `Best regards`
    );

    window.location.href = `mailto:${item.supplier.email}?subject=${subject}&body=${body}`;
  };

  const handleCreateOrder = (item) => {
    
    alert(`Creating order for ${item.itemName} - ${item.suggestedOrderQuantity} ${item.unit}`);
  };

  const handleExportCSV = () => {
    if (!filteredItems.length) return;

    const headers = [
      'Item Name',
      'SKU',
      'Category',
      'Priority',
      'Current Stock',
      'Min Stock',
      'Unit',
      'Supplier',
      'Suggested Qty',
      'Order Cost',
      'Contact',
      'Email',
      'Phone',
    ];

    const rows = filteredItems.map(item => [
      item.itemName,
      item.skuCode,
      item.category,
      item.priority,
      item.currentStock,
      item.minimumStock,
      item.unit,
      item.supplier.name,
      item.suggestedOrderQuantity,
      item.orderCost.toFixed(2),
      item.supplier.contactPerson || '',
      item.supplier.email || '',
      item.supplier.phone || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPriorityFilter('');
    setSupplierFilter('');
  };

  const hasActiveFilters = searchQuery || categoryFilter || priorityFilter || supplierFilter;

  
  if (loading) {
    return (
      <div className="space-y-6">
        {}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-96"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => (
            <StatCard key={i} loading={true} />
          ))}
        </div>

        {/* Content Skeleton */}
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Low Stock Report</h1>
        </div>
        <Card className="p-12">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Report</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchLowStockReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Low Stock Report</h1>
            <p className="text-red-100 text-sm md:text-base">
              Items requiring immediate attention and reordering
            </p>
          </div>
          <button
            onClick={fetchLowStockReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          title="Total Low Stock Items"
          value={summary.totalItems || 0}
          icon={Package}
          iconColor="bg-blue-600"
        />
        <StatCard
          title="High Priority"
          value={summary.highPriority || 0}
          icon={AlertTriangle}
          iconColor="bg-red-600"
        />
        <StatCard
          title="Medium Priority"
          value={summary.mediumPriority || 0}
          icon={TrendingDown}
          iconColor="bg-orange-600"
        />
        <StatCard
          title="Low Priority"
          value={summary.lowPriority || 0}
          icon={TrendingDown}
          iconColor="bg-yellow-600"
        />
        <StatCard
          title="Total Reorder Cost"
          value={`$${(summary.totalOrderCost || 0).toLocaleString()}`}
          icon={DollarSign}
          iconColor="bg-green-600"
        />
      </div>

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search and Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name, SKU, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {[categoryFilter, priorityFilter, supplierFilter].filter(Boolean).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!filteredItems.length}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Supplier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No items match your filters' : 'No low stock items'}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'All items are well stocked. Great job!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEmailSupplier={handleEmailSupplier}
                onCreateOrder={handleCreateOrder}
              />
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Item Details
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Stock Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Order Details
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Priority */}
                      <td className="py-4 px-4">
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* Item Details */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{item.itemName}</p>
                          <p className="text-sm text-gray-500">SKU: {item.skuCode}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Current:</span>
                            <span className="font-semibold text-gray-900">
                              {item.currentStock} {item.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Minimum:</span>
                            <span className="font-medium text-gray-700">
                              {item.minimumStock} {item.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{item.supplier.name}</p>
                          {item.supplier.contactPerson && (
                            <p className="text-sm text-gray-600">{item.supplier.contactPerson}</p>
                          )}
                          {item.supplier.email && (
                            <a
                              href={`mailto:${item.supplier.email}`}
                              className="text-xs text-blue-600 hover:underline block"
                            >
                              {item.supplier.email}
                            </a>
                          )}
                          {item.supplier.phone && (
                            <a
                              href={`tel:${item.supplier.phone}`}
                              className="text-xs text-blue-600 hover:underline block"
                            >
                              {item.supplier.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Order Details */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Suggested:</span>
                            <span className="font-medium text-gray-900">
                              {item.suggestedOrderQuantity} {item.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Cost:</span>
                            <span className="font-semibold text-blue-600">
                              ${item.orderCost.toFixed(2)}
                            </span>
                          </div>
                          {item.supplier.leadTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {item.supplier.leadTime} days
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEmailSupplier(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Email Supplier"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateOrder(item)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Create Order"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredItems.length} of {data?.items?.length || 0} items
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LowStockReport;
