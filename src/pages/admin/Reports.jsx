import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  Download,
  Eye,
  ChevronRight,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileDown,
  ShoppingCart,
  Award,
  Clock,
} from 'lucide-react';


const API_BASE_URL = 'http://localhost:5001/api';


const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Report Type Card Component
const ReportCard = ({
  icon: Icon,
  title,
  description,
  iconColor,
  iconBgColor,
  onView,
  onExportCSV,
  onExportPDF,
  stats
}) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex flex-col h-full">
        {}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          {stats && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.value}</p>
              {stats.label && (
                <p className="text-xs text-gray-500 mt-1">{stats.label}</p>
              )}
            </div>
          )}
        </div>

        {}
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">View Report</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export as CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={onExportPDF}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Export as PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};


const QuickStat = ({ icon: Icon, label, value, change, changeType }) => {
  const isPositive = changeType === 'positive';
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${changeBgColor}`}>
          <Icon className={`w-5 h-5 ${changeColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 mb-1 truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900">{value}</p>
            {change && (
              <span className={`text-xs font-medium ${changeColor}`}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Recent Reports List Component
const RecentReportsList = ({ reports, loading, onViewReport }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No recent reports</p>
        <p className="text-sm text-gray-400 mt-1">Generate a report to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((report, index) => (
        <button
          key={index}
          onClick={() => onViewReport(report)}
          className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
        >
          <div className={`p-2 rounded-lg ${report.bgColor || 'bg-blue-50'}`}>
            <FileText className={`w-5 h-5 ${report.color || 'text-blue-600'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {report.name}
              </h4>
              {report.badge && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  report.badge === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {report.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {report.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {report.time}
              </span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      ))}
    </div>
  );
};

// Filter Bar Component
const FilterBar = ({ dateRange, setDateRange, reportType, setReportType }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <BarChart3 className="w-4 h-4 text-gray-500" />
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Reports</option>
          <option value="sales">Sales Reports</option>
          <option value="inventory">Inventory Reports</option>
          <option value="customer">Customer Reports</option>
          <option value="financial">Financial Reports</option>
        </select>
      </div>
    </div>
  );
};

// Main Reports Component
const Reports = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('all');
  const [quickStats, setQuickStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);

  // Fetch quick stats
  const fetchQuickStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setQuickStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Use mock data for development
      setQuickStats(getMockStats());
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent reports
  const fetchRecentReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent reports');
      }

      const data = await response.json();
      setRecentReports(data);
    } catch (err) {
      console.error('Error fetching recent reports:', err);
      // Use mock data for development
      setRecentReports(getMockRecentReports());
    }
  };

  useEffect(() => {
    fetchQuickStats();
    fetchRecentReports();
  }, [dateRange]);

  // Mock data for development
  const getMockStats = () => ({
    totalSales: { value: '$125,840', change: '+12.5%', changeType: 'positive' },
    totalInventory: { value: '$84,320', change: '+5.2%', changeType: 'positive' },
    activeCustomers: { value: '1,248', change: '+8.3%', changeType: 'positive' },
    lowStockItems: { value: '23', change: '-15.4%', changeType: 'positive' },
  });

  const getMockRecentReports = () => [
    {
      name: 'Monthly Sales Report - January 2026',
      date: 'Feb 01, 2026',
      time: '2 hours ago',
      badge: 'New',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      type: 'sales',
    },
    {
      name: 'Inventory Valuation Report',
      date: 'Jan 31, 2026',
      time: '1 day ago',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      type: 'inventory',
    },
    {
      name: 'Top Selling Items - Q4 2025',
      date: 'Jan 30, 2026',
      time: '2 days ago',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      type: 'sales',
    },
    {
      name: 'Customer Analytics Report',
      date: 'Jan 28, 2026',
      time: '4 days ago',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      type: 'customer',
    },
    {
      name: 'Low Stock Alert Report',
      date: 'Jan 27, 2026',
      time: '5 days ago',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      type: 'inventory',
    },
  ];

  // Report configurations
  const reportTypes = [
    {
      id: 'sales',
      icon: TrendingUp,
      title: 'Sales Report',
      description: 'Comprehensive analysis of sales performance, revenue trends, and order statistics over selected periods.',
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
      stats: { value: '$125.8K', label: 'This month' },
      path: '/reports/sales',
    },
    {
      id: 'inventory',
      icon: Package,
      title: 'Inventory Valuation',
      description: 'Detailed breakdown of current inventory value, stock levels, and asset distribution across categories.',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
      stats: { value: '$84.3K', label: 'Total value' },
      path: '/reports/inventory',
    },
    {
      id: 'top-items',
      icon: Award,
      title: 'Top Selling Items',
      description: 'Identify best-performing products by sales volume, revenue contribution, and growth trends.',
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-50',
      stats: { value: '156', label: 'Active items' },
      path: '/reports/top-items',
    },
    {
      id: 'customers',
      icon: Users,
      title: 'Customer Report',
      description: 'Customer analytics including purchase patterns, lifetime value, retention rates, and demographics.',
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
      stats: { value: '1,248', label: 'Active customers' },
      path: '/reports/customers',
    },
    {
      id: 'low-stock',
      icon: AlertTriangle,
      title: 'Low Stock Report',
      description: 'Critical stock level alerts, reorder recommendations, and inventory shortage analysis.',
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-50',
      stats: { value: '23', label: 'Items low' },
      path: '/reports/low-stock',
    },
    {
      id: 'profit',
      icon: DollarSign,
      title: 'Profit Analysis',
      description: 'In-depth profit margins, cost analysis, markup percentages, and financial performance metrics.',
      iconColor: 'text-emerald-600',
      iconBgColor: 'bg-emerald-50',
      stats: { value: '38.5%', label: 'Avg margin' },
      path: '/reports/profit',
    },
  ];

  // Handle report actions
  const handleViewReport = (reportId) => {
    const report = reportTypes.find(r => r.id === reportId);
    if (report && report.path) {
      navigate(report.path);
    } else {
      console.log(`Viewing report: ${reportId}`);
      // TODO: Implement navigation to detailed report page
    }
  };

  const handleExportCSV = async (reportId) => {
    console.log(`Exporting ${reportId} as CSV`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/export/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Export functionality will be implemented soon');
    }
  };

  const handleExportPDF = async (reportId) => {
    console.log(`Exporting ${reportId} as PDF`);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Export functionality will be implemented soon');
    }
  };

  const handleViewRecentReport = (report) => {
    console.log('Viewing recent report:', report);
    // TODO: Implement navigation to specific report
  };

  const handleRefresh = () => {
    fetchQuickStats();
    fetchRecentReports();
  };

  const stats = quickStats || getMockStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Reports Dashboard
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              Generate, view, and export comprehensive business reports
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={TrendingUp}
          label="Total Sales"
          value={stats.totalSales?.value || '$0'}
          change={stats.totalSales?.change}
          changeType={stats.totalSales?.changeType || 'positive'}
        />
        <QuickStat
          icon={Package}
          label="Inventory Value"
          value={stats.totalInventory?.value || '$0'}
          change={stats.totalInventory?.change}
          changeType={stats.totalInventory?.changeType || 'positive'}
        />
        <QuickStat
          icon={Users}
          label="Active Customers"
          value={stats.activeCustomers?.value || '0'}
          change={stats.activeCustomers?.change}
          changeType={stats.activeCustomers?.changeType || 'positive'}
        />
        <QuickStat
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats.lowStockItems?.value || '0'}
          change={stats.lowStockItems?.change}
          changeType={stats.lowStockItems?.changeType || 'positive'}
        />
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <FilterBar
          dateRange={dateRange}
          setDateRange={setDateRange}
          reportType={reportType}
          setReportType={setReportType}
        />
      </Card>

      {/* Report Type Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
          <span className="text-sm text-gray-500">{reportTypes.length} report types</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <ReportCard
              key={report.id}
              icon={report.icon}
              title={report.title}
              description={report.description}
              iconColor={report.iconColor}
              iconBgColor={report.iconBgColor}
              stats={report.stats}
              onView={() => handleViewReport(report.id)}
              onExportCSV={() => handleExportCSV(report.id)}
              onExportPDF={() => handleExportPDF(report.id)}
            />
          ))}
        </div>
      </div>

      {/* Recent Reports Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Recent Reports</h2>
            <p className="text-sm text-gray-500">Recently generated and accessed reports</p>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <RecentReportsList
          reports={recentReports}
          loading={loading}
          onViewReport={handleViewRecentReport}
        />
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Need Help with Reports?</h3>
            <p className="text-sm text-gray-600">
              Learn how to generate, customize, and export reports to gain insights into your business performance.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            View Documentation
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
