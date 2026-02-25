import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, TrendingUp, AlertTriangle, Calendar,
  DollarSign, Package, ShoppingCart, BarChart3
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import reportService from '../../services/reportService';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportService.dashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const reportCards = [
    {
      title: 'Sales Report',
      description: 'View detailed sales analytics and trends',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      path: '/reports/sales',
      stats: dashboardData?.summary?.totalSales
        ? `$${dashboardData.summary.totalSales.toLocaleString()}`
        : 'Loading...',
    },
    {
      title: 'Low Stock Report',
      description: 'View items that need restocking',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      path: '/reports/low-stock',
      stats: dashboardData?.lowStock?.count
        ? `${dashboardData.lowStock.count} items`
        : 'Loading...',
    },
  ];

  
  const getPreviewChartData = () => {
    if (!dashboardData?.recentSales) return [];

    return dashboardData.recentSales.slice(0, 7).map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      sales: item.sales || 0,
      orders: item.orders || 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = getPreviewChartData();
  const summary = dashboardData?.summary || {};
  const lowStock = dashboardData?.lowStock || {};

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports</h1>
            <p className="text-slate-600">View and analyze business reports</p>
          </div>

          {}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickDateRange(7)}
            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickDateRange(30)}
            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={handleThisMonth}
            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            This Month
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">Total Sales</p>
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">
            ${summary.totalSales?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-white mt-2">
            {summary.salesChange >= 0 ? '+' : ''}{summary.salesChange?.toFixed(1) || 0}% from last period
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">Total Profit</p>
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">
            ${summary.totalProfit?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-white mt-2">
            {summary.profitMargin?.toFixed(1) || 0}% profit margin
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">Total Orders</p>
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">
            {summary.totalOrders?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-white mt-2">
            Avg: ${summary.averageOrderValue?.toFixed(2) || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">Low Stock Items</p>
            <Package className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">
            {lowStock.count || 0}
          </p>
          <p className="text-sm text-white mt-2">
            {lowStock.critical || 0} critical priority
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Sales Trend (7 Days)</h2>
            <button
              onClick={() => navigate('/reports/sales')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Orders Overview (7 Days)</h2>
            <button
              onClick={() => navigate('/reports/sales')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Bar dataKey="orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Detailed Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(report.path)}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-2xl font-bold text-slate-900">{report.stats}</p>
                </div>
              </div>
            );
          })}

          {}
          <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center cursor-not-allowed opacity-60">
            <BarChart3 className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">More Reports</h3>
            <p className="text-sm text-slate-500">Additional reports coming soon</p>
          </div>
        </div>
      </div>

      {}
      {lowStock.count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-1">
                Low Stock Alert
              </h3>
              <p className="text-amber-700 mb-3">
                You have {lowStock.count} items with low stock levels.
                {lowStock.critical > 0 && ` ${lowStock.critical} items are at critical level.`}
              </p>
              <button
                onClick={() => navigate('/reports/low-stock')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                View Low Stock Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
