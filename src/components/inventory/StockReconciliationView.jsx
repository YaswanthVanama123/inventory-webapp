import React, { useState, useEffect } from 'react';
import { Download, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

/**
 * StockReconciliationView Component
 * Shows unified stock view by mapping purchases to sales
 */
const StockReconciliationView = () => {
  const [stockItems, setStockItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in_stock, out_of_stock, oversold

  useEffect(() => {
    fetchStockReconciliation();
  }, []);

  const fetchStockReconciliation = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stock-reconciliation');
      console.log('[StockReconciliationView] API response:', response);
      const items = response.data?.items || [];
      const summaryData = response.data?.summary || null;
      console.log('[StockReconciliationView] Parsed items:', items.length, 'items');
      setStockItems(items);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching stock reconciliation:', err);
      setStockItems([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStockReport = () => {
    // Create CSV content
    const headers = 'SKU,Item Name,Purchased Qty,Avg Purchase Price,Sold Qty,Avg Sale Price,Current Stock,Status,Profit Margin %';
    const rows = filteredItems.map(item => {
      const cleanName = (item.name || '').replace(/[\t\r\n,]/g, ' ').replace(/\s+/g, ' ').trim();
      return [
        item.sku,
        cleanName,
        item.purchased.quantity,
        item.purchased.avgPrice.toFixed(2),
        item.sold.quantity,
        item.sold.avgPrice.toFixed(2),
        item.stock.current,
        item.stock.status,
        item.stock.profitMargin
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-reconciliation-${new Date().toISOString().split('T')[0]}.csv`;
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

  const getStatusVariant = (status) => {
    const statusMap = {
      'IN_STOCK': 'success',
      'OUT_OF_STOCK': 'warning',
      'OVERSOLD': 'danger'
    };
    return statusMap[status] || 'secondary';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'IN_STOCK': 'In Stock',
      'OUT_OF_STOCK': 'Out of Stock',
      'OVERSOLD': 'Oversold'
    };
    return labelMap[status] || status;
  };

  const filteredItems = stockItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'in_stock') return item.stock.status === 'IN_STOCK';
    if (filter === 'out_of_stock') return item.stock.status === 'OUT_OF_STOCK';
    if (filter === 'oversold') return item.stock.status === 'OVERSOLD';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading stock reconciliation..." />
      </div>
    );
  }

  if (stockItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-900 font-semibold text-lg mb-2">No stock data available</p>
        <p className="text-sm text-slate-500">
          Sync CustomerConnect purchases and RouteStar invoices to see stock reconciliation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium mb-1">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{summary.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium mb-1">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{summary.inStock}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.outOfStock}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium mb-1">Oversold</p>
                <p className="text-2xl font-bold text-red-600">{summary.oversold}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Download */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({stockItems.length})
            </button>
            <button
              onClick={() => setFilter('in_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in_stock'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              In Stock ({summary?.inStock || 0})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'out_of_stock'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Out of Stock ({summary?.outOfStock || 0})
            </button>
            <button
              onClick={() => setFilter('oversold')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'oversold'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Oversold ({summary?.oversold || 0})
            </button>
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadStockReport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Purchased
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Avg Buy
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Avg Sell
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Profit %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item, index) => (
                <tr key={`${item.sku}-${index}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-slate-900">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 max-w-xs truncate">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {item.purchased.quantity}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.purchased.orderCount} orders
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-semibold text-emerald-600">
                      {item.sold.quantity}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.sold.invoiceCount} invoices
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-base font-bold ${
                      item.stock.current < 0 ? 'text-red-600' :
                      item.stock.current === 0 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {item.stock.current}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={getStatusVariant(item.stock.status)} size="sm">
                      {getStatusLabel(item.stock.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                    {formatCurrency(item.purchased.avgPrice)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                    {formatCurrency(item.sold.avgPrice)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      item.stock.profitMargin > 0 ? 'text-green-600' :
                      item.stock.profitMargin < 0 ? 'text-red-600' :
                      'text-slate-600'
                    }`}>
                      {item.stock.profitMargin > 0 ? '+' : ''}{item.stock.profitMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No items found for this filter</p>
        </div>
      )}
    </div>
  );
};

export default StockReconciliationView;
