import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, DollarSign, ShoppingCart, Download,
  Calendar, Filter, FileText, FileSpreadsheet
} from 'lucide-react';
import reportService from '../../services/reportService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const SalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, selectedCategory]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const response = await reportService.sales(params);
      setSalesData(response.data);

      // Extract unique categories from the data
      if (response.data?.categoryBreakdown) {
        const cats = response.data.categoryBreakdown.map(item => item.category);
        setCategories([...new Set(cats)]);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDateRange = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
  };

  const handleThisMonth = () => {
    const now = new Date();
    setDateRange({
      startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
    });
  };

  const exportToCSV = () => {
    if (!salesData) return;

    const csvData = salesData.dailySales?.map(item => ({
      Date: item.date,
      Sales: item.sales,
      Orders: item.orders,
      Profit: item.profit,
    })) || [];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!salesData) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);

    // Date Range
    doc.setFontSize(11);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 32);

    // Summary Stats
    doc.setFontSize(12);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Sales: $${salesData.summary?.totalSales?.toLocaleString() || 0}`, 14, 52);
    doc.text(`Total Profit: $${salesData.summary?.totalProfit?.toLocaleString() || 0}`, 14, 58);
    doc.text(`Total Orders: ${salesData.summary?.totalOrders?.toLocaleString() || 0}`, 14, 64);
    doc.text(`Average Order Value: $${salesData.summary?.averageOrderValue?.toFixed(2) || 0}`, 14, 70);

    // Daily Sales Table
    if (salesData.dailySales && salesData.dailySales.length > 0) {
      doc.autoTable({
        startY: 80,
        head: [['Date', 'Sales', 'Orders', 'Profit']],
        body: salesData.dailySales.map(item => [
          item.date,
          `$${item.sales?.toLocaleString() || 0}`,
          item.orders || 0,
          `$${item.profit?.toLocaleString() || 0}`,
        ]),
      });
    }

    // Category Breakdown Table
    if (salesData.categoryBreakdown && salesData.categoryBreakdown.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Category Breakdown', 14, 20);
      doc.autoTable({
        startY: 28,
        head: [['Category', 'Sales', 'Orders', 'Percentage']],
        body: salesData.categoryBreakdown.map(item => [
          item.category,
          `$${item.sales?.toLocaleString() || 0}`,
          item.orders || 0,
          `${item.percentage?.toFixed(1) || 0}%`,
        ]),
      });
    }

    doc.save(`sales_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = salesData?.summary || {
    totalSales: 0,
    totalProfit: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };

  const dailySales = salesData?.dailySales || [];
  const categoryBreakdown = salesData?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales Report</h1>
            <p className="text-slate-600">Detailed sales analytics and trends</p>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDateRange(7)}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                7 Days
              </button>
              <button
                onClick={() => handleQuickDateRange(30)}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                30 Days
              </button>
              <button
                onClick={handleThisMonth}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Total Sales</p>
            <DollarSign className="w-6 h-6 text-blue-100" />
          </div>
          <p className="text-3xl font-bold">${summary.totalSales?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Total Profit</p>
            <TrendingUp className="w-6 h-6 text-green-100" />
          </div>
          <p className="text-3xl font-bold">${summary.totalProfit?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-100">Total Orders</p>
            <ShoppingCart className="w-6 h-6 text-indigo-100" />
          </div>
          <p className="text-3xl font-bold">{summary.totalOrders?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100">Avg Order Value</p>
            <DollarSign className="w-6 h-6 text-orange-100" />
          </div>
          <p className="text-3xl font-bold">${summary.averageOrderValue?.toFixed(2) || 0}</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Sales Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Sales ($)"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2}
                name="Profit ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Orders</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Category Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="sales"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.category}: ${entry.percentage?.toFixed(1)}%`}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Sales</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">%</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-900">{item.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900">
                      ${item.sales?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900">
                      {item.orders || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900">
                      {item.percentage?.toFixed(1) || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
