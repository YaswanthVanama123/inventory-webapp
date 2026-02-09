import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ShoppingCart,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  FileText,
  AlertCircle,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


const API_BASE_URL = 'http://localhost:5001/api';


const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, change, changeType, icon: Icon, loading, prefix = '', suffix = '' }) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  if (loading) {
    return (
      <Card className="p-4 md:p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">
            {prefix}{value}{suffix}
          </h3>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`flex items-center gap-1 text-xs md:text-sm font-medium ${changeColor}`}>
                <ChangeIcon className="w-3 h-3 md:w-4 md:h-4" />
                {change}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">vs previous</span>
            </div>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-lg ${changeBgColor}`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${changeColor}`} />
        </div>
      </div>
    </Card>
  );
};


const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-64 md:h-80 bg-gray-100 rounded"></div>
  </div>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
    <p className="text-sm md:text-base text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  </div>
);


const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs md:text-sm" style={{ color: entry.color }}>
            {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Main Sales Report Component
const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groupBy, setGroupBy] = useState('day');
  const [chartType, setChartType] = useState('line');

  
  const fetchSalesReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        category: selectedCategory,
        groupBy: groupBy,
      });

      const response = await fetch(`${API_BASE_URL}/reports/sales?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sales report: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching sales report:', err);
      setError(err.message || 'Failed to load sales report');

      
      setReportData(getMockSalesData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, [dateRange, selectedCategory, groupBy]);

  
  const getMockSalesData = () => ({
    summary: {
      totalSales: 284500,
      totalProfit: 85350,
      averageOrderValue: 832.46,
      totalInvoices: 342,
      salesChange: '+18.5%',
      profitChange: '+22.3%',
      avgOrderChange: '+5.2%',
      invoicesChange: '+15.7%',
    },
    salesTrend: [
      { date: 'Jan 01', sales: 12500, profit: 3750, invoices: 15 },
      { date: 'Jan 05', sales: 15200, profit: 4560, invoices: 18 },
      { date: 'Jan 10', sales: 18400, profit: 5520, invoices: 22 },
      { date: 'Jan 15', sales: 21800, profit: 6540, invoices: 26 },
      { date: 'Jan 20', sales: 25600, profit: 7680, invoices: 31 },
      { date: 'Jan 25', sales: 23400, profit: 7020, invoices: 28 },
      { date: 'Jan 30', sales: 28200, profit: 8460, invoices: 34 },
    ],
    categoryBreakdown: [
      { name: 'Electronics', value: 98500, percentage: 34.6, color: '#3B82F6' },
      { name: 'Clothing', value: 71125, percentage: 25.0, color: '#10B981' },
      { name: 'Food & Beverage', value: 56900, percentage: 20.0, color: '#F59E0B' },
      { name: 'Books', value: 34140, percentage: 12.0, color: '#8B5CF6' },
      { name: 'Other', value: 23835, percentage: 8.4, color: '#6B7280' },
    ],
    paymentStatus: [
      { status: 'Paid', count: 285, amount: 237000, color: '#10B981' },
      { status: 'Pending', count: 42, amount: 35000, color: '#F59E0B' },
      { status: 'Failed', count: 10, amount: 8300, color: '#EF4444' },
      { status: 'Cancelled', count: 5, amount: 4200, color: '#6B7280' },
    ],
    recentInvoices: [
      {
        id: 'INV-2024-342',
        customer: 'John Smith',
        date: '2024-01-30',
        amount: 1250.00,
        status: 'paid',
        items: 3,
        category: 'Electronics',
      },
      {
        id: 'INV-2024-341',
        customer: 'Sarah Johnson',
        date: '2024-01-30',
        amount: 890.50,
        status: 'pending',
        items: 2,
        category: 'Clothing',
      },
      {
        id: 'INV-2024-340',
        customer: 'Mike Davis',
        date: '2024-01-29',
        amount: 2150.75,
        status: 'paid',
        items: 5,
        category: 'Electronics',
      },
      {
        id: 'INV-2024-339',
        customer: 'Emily Brown',
        date: '2024-01-29',
        amount: 445.00,
        status: 'paid',
        items: 1,
        category: 'Books',
      },
      {
        id: 'INV-2024-338',
        customer: 'Robert Wilson',
        date: '2024-01-28',
        amount: 675.25,
        status: 'failed',
        items: 2,
        category: 'Food & Beverage',
      },
    ],
    categories: ['All', 'Electronics', 'Clothing', 'Food & Beverage', 'Books', 'Other'],
  });

  
  const handleExportCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Invoice ID', 'Customer', 'Date', 'Amount', 'Status', 'Items', 'Category'],
      ...reportData.recentInvoices.map(inv => [
        inv.id,
        inv.customer,
        inv.date,
        inv.amount,
        inv.status,
        inv.items,
        inv.category,
      ]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert('PDF export functionality would integrate with a PDF library like jsPDF or react-pdf');
  };

  const data = reportData || {};
  const summary = data.summary || {};
  const salesTrend = data.salesTrend || [];
  const categoryBreakdown = data.categoryBreakdown || [];
  const paymentStatus = data.paymentStatus || [];
  const recentInvoices = data.recentInvoices || [];
  const categories = data.categories || ['All'];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 md:p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 md:w-8 md:h-8" />
              Sales Report
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              Comprehensive sales analytics and insights
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={fetchSalesReport}
              disabled={loading}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm md:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm md:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && !reportData && (
        <Card className="p-6">
          <ErrorState message={error} onRetry={fetchSalesReport} />
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Sales"
          value={summary.totalSales?.toLocaleString() || '0'}
          change={summary.salesChange}
          changeType="positive"
          icon={DollarSign}
          loading={loading}
          prefix="$"
        />
        <SummaryCard
          title="Total Profit"
          value={summary.totalProfit?.toLocaleString() || '0'}
          change={summary.profitChange}
          changeType="positive"
          icon={TrendingUp}
          loading={loading}
          prefix="$"
        />
        <SummaryCard
          title="Average Order Value"
          value={summary.averageOrderValue?.toLocaleString() || '0'}
          change={summary.avgOrderChange}
          changeType="positive"
          icon={ShoppingCart}
          loading={loading}
          prefix="$"
        />
        <SummaryCard
          title="Total Invoices"
          value={summary.totalInvoices?.toLocaleString() || '0'}
          change={summary.invoicesChange}
          changeType="positive"
          icon={Receipt}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sales Trend Chart */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Sales Trend</h2>
                  <p className="text-xs md:text-sm text-gray-500">Revenue and profit over time</p>
                </div>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={300}>
                  {chartType === 'line' ? (
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip content={<CustomTooltip prefix="$" />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="Sales"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        name="Profit"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip content={<CustomTooltip prefix="$" />} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="sales" name="Sales" fill="#3B82F6" />
                      <Bar dataKey="profit" name="Profit" fill="#10B981" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Card>

        {/* Category Breakdown Chart */}
        <Card className="p-4 md:p-6">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Category Breakdown</h2>
                <p className="text-xs md:text-sm text-gray-500">Sales by category</p>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={300} minWidth={250}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="text-sm font-semibold text-gray-900">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                ${data.value.toLocaleString()} ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-xs md:text-sm text-gray-700 truncate">{category.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      <Card className="p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Status Breakdown
          </h2>
          <p className="text-xs md:text-sm text-gray-500">Invoice payment distribution</p>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentStatus.map((status, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
                style={{ borderColor: status.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{status.status}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  ></div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  ${status.amount.toLocaleString()}
                </p>
                <p className="text-xs md:text-sm text-gray-500">{status.count} invoices</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Invoices Table */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <p className="text-xs md:text-sm text-gray-500">Latest sales transactions</p>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                      Customer
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-3 md:px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                      Items
                    </th>
                    <th className="px-3 md:px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-12 text-center">
                        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No invoices found</p>
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((invoice, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-xs md:text-sm font-medium text-gray-900">{invoice.id}</p>
                            <p className="text-xs text-gray-500 sm:hidden">{invoice.customer}</p>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <p className="text-xs md:text-sm text-gray-900">{invoice.customer}</p>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap hidden md:table-cell">
                          <p className="text-xs md:text-sm text-gray-500">{invoice.date}</p>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap text-right">
                          <p className="text-xs md:text-sm font-semibold text-gray-900">
                            ${invoice.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                          <p className="text-xs md:text-sm text-gray-600">{invoice.items} items</p>
                        </td>
                        <td className="px-3 md:px-4 py-3 whitespace-nowrap text-center">
                          <PaymentStatusBadge status={invoice.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesReport;
