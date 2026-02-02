import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Package, Phone, Mail, MapPin,
  Download, FileText, FileSpreadsheet, ShoppingCart,
  TrendingDown, Search
} from 'lucide-react';
import reportService from '../../services/reportService';
import inventoryService from '../../services/inventoryService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const LowStockReport = () => {
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const response = await reportService.reorderList();
      setLowStockItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching low stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLevel = (currentStock, minStock, reorderPoint) => {
    const stockPercentage = (currentStock / reorderPoint) * 100;
    if (currentStock === 0) return 'critical';
    if (stockPercentage <= 25) return 'high';
    if (stockPercentage <= 50) return 'medium';
    return 'low';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      critical: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Critical'
      },
      high: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        label: 'High'
      },
      medium: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        label: 'Medium'
      },
      low: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        label: 'Low'
      }
    };

    const badge = badges[priority] || badges.low;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        <AlertTriangle className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const handleOrderNow = async (itemId, itemName) => {
    if (window.confirm(`Do you want to order ${itemName}?`)) {
      // Here you would typically integrate with your ordering system
      alert('Order functionality will be implemented based on your ordering workflow');
    }
  };

  const exportToCSV = () => {
    const csvData = filteredItems.map(item => ({
      'Item Name': item.itemName,
      'SKU': item.skuCode,
      'Category': item.category,
      'Current Stock': item.currentStock,
      'Min Stock': item.minStock,
      'Reorder Point': item.reorderPoint,
      'Priority': getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint),
      'Supplier': item.supplier?.name || 'N/A',
      'Supplier Email': item.supplier?.email || 'N/A',
      'Supplier Phone': item.supplier?.phone || 'N/A',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    
    doc.setFontSize(18);
    doc.text('Low Stock Report', 14, 22);

    
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    
    doc.setFontSize(12);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    const criticalCount = filteredItems.filter(item =>
      getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint) === 'critical'
    ).length;
    const highCount = filteredItems.filter(item =>
      getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint) === 'high'
    ).length;

    doc.text(`Total Items: ${filteredItems.length}`, 14, 52);
    doc.text(`Critical Priority: ${criticalCount}`, 14, 58);
    doc.text(`High Priority: ${highCount}`, 14, 64);

    
    doc.autoTable({
      startY: 75,
      head: [['Item Name', 'SKU', 'Current', 'Min', 'Priority']],
      body: filteredItems.map(item => [
        item.itemName,
        item.skuCode,
        item.currentStock,
        item.minStock,
        getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint).toUpperCase()
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`low_stock_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredItems = lowStockItems.filter(item => {
    const priority = getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint);
    const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.skuCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const stats = {
    total: lowStockItems.length,
    critical: lowStockItems.filter(item =>
      getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint) === 'critical'
    ).length,
    high: lowStockItems.filter(item =>
      getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint) === 'high'
    ).length,
    medium: lowStockItems.filter(item =>
      getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint) === 'medium'
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Low Stock Report</h1>
            <p className="text-slate-600">Items that need restocking</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Total Items</p>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-600">Critical</p>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.critical}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-600">High Priority</p>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-700">{stats.high}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-600">Medium Priority</p>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-700">{stats.medium}</p>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Item</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Stock Level</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Priority</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Supplier</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const priority = getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint);
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-900">{item.itemName}</p>
                        <p className="text-sm text-slate-500">SKU: {item.skuCode}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-700">Current:</span>
                          <span className={`font-semibold ${item.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {item.currentStock}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Min: {item.minStock}</span>
                          <span>|</span>
                          <span>Reorder: {item.reorderPoint}</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              priority === 'critical' ? 'bg-red-500' :
                              priority === 'high' ? 'bg-orange-500' :
                              priority === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min((item.currentStock / item.reorderPoint) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getPriorityBadge(priority)}
                    </td>
                    <td className="py-4 px-6">
                      {item.supplier ? (
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{item.supplier.name}</p>
                          {item.supplier.email && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail className="w-3 h-3" />
                              {item.supplier.email}
                            </div>
                          )}
                          {item.supplier.phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone className="w-3 h-3" />
                              {item.supplier.phone}
                            </div>
                          )}
                          {item.supplier.address && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin className="w-3 h-3" />
                              {item.supplier.address}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No supplier</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOrderNow(item._id, item.itemName)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Order Now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredItems.map((item, index) => {
          const priority = getPriorityLevel(item.currentStock, item.minStock, item.reorderPoint);
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.itemName}</h3>
                  <p className="text-sm text-slate-500">SKU: {item.skuCode}</p>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>
                {getPriorityBadge(priority)}
              </div>

              {/* Stock Level */}
              <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-700">Stock Level</span>
                  <span className={`font-semibold ${item.currentStock === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {item.currentStock} / {item.reorderPoint}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      priority === 'critical' ? 'bg-red-500' :
                      priority === 'high' ? 'bg-orange-500' :
                      priority === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min((item.currentStock / item.reorderPoint) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Min: {item.minStock}</span>
                  <span>Reorder: {item.reorderPoint}</span>
                </div>
              </div>

              {/* Supplier Info */}
              {item.supplier && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Supplier</p>
                  <p className="text-sm text-blue-800 mb-1">{item.supplier.name}</p>
                  {item.supplier.email && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
                      <Mail className="w-3 h-3" />
                      {item.supplier.email}
                    </div>
                  )}
                  {item.supplier.phone && (
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <Phone className="w-3 h-3" />
                      {item.supplier.phone}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleOrderNow(item._id, item.itemName)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Order Now
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Items Found</h3>
          <p className="text-slate-600">
            {searchTerm || filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'All items are adequately stocked'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStockReport;
