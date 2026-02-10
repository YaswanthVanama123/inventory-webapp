import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import dashboardService from '../../services/dashboardService';
import {
  Package,
  DollarSign,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  ShoppingCart,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon: Icon, loading }) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
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
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                <ChangeIcon className="w-4 h-4" />
                {change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${changeBgColor}`}>
          <Icon className={`w-6 h-6 ${changeColor}`} />
        </div>
      </div>
    </Card>
  );
};


const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="h-64 bg-gray-100 rounded"></div>
  </div>
);

// Recent Activity Table Component
const RecentActivityTable = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Activity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden md:table-cell">User</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 hidden sm:table-cell">Time</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'create' ? 'bg-green-500' :
                    activity.type === 'update' ? 'bg-blue-500' :
                    activity.type === 'delete' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 md:hidden">{activity.user}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{activity.user}</td>
              <td className="py-3 px-4 text-sm text-gray-500 hidden sm:table-cell">{activity.time}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="View">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    { icon: Plus, label: 'Add Item', color: 'bg-blue-600 hover:bg-blue-700', path: '/items/new' },
    { icon: FileText, label: 'New Invoice', color: 'bg-green-600 hover:bg-green-700', path: '/invoices/new' },
    { icon: Users, label: 'Manage Users', color: 'bg-indigo-600 hover:bg-indigo-700', path: '/users' },
    { icon: Activity, label: 'View Reports', color: 'bg-orange-600 hover:bg-orange-700', path: '/reports' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-lg text-white transition-all duration-200 transform hover:scale-105 ${action.color}`}
          >
            <Icon className="w-6 h-6 md:w-8 md:h-8 mb-2" />
            <span className="text-xs md:text-sm font-medium text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { showError } = useContext(ToastContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    console.log('fetchDashboardData called - starting API request...');
    setLoading(true);
    setError(null);

    try {
      console.log('Making API request to dashboardService.getDashboardData()...');
      const response = await dashboardService.getDashboardData();

      console.log('=== FRONTEND DASHBOARD DEBUG ===');
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);

      if (response.success && response.data) {
        const { summary, categoryStats, recentActivity, topSellingItems, salesTrend } = response.data;
        console.log('Summary data:', summary);
        console.log('Sales trend:', salesTrend);
        console.log('Top selling items:', topSellingItems);

        // Transform backend data to frontend format
        const transformedData = {
          stats: {
            totalRevenue: summary.totalRevenue || 0,
            totalOrders: summary.totalOrders || 0,
            lowStockItems: summary.lowStockCount || 0,
            profitMargin: summary.profitMargin || 0,
            revenueChange: summary.revenueChange || 0,
            ordersChange: summary.ordersChange || 0,
            lowStockChange: summary.lowStockChange || 0,
            profitMarginChange: summary.profitMarginChange || 0,
            // Purchase order statistics from CustomerConnect automation
            totalPurchaseAmount: summary.totalPurchaseAmount || 0,
            totalPurchaseOrders: summary.totalPurchaseOrders || 0,
            avgPurchaseValue: summary.avgPurchaseValue || 0,
            dataSource: summary.dataSource || 'manual',
          },
          salesTrend: salesTrend?.map(trend => ({
            month: trend.month,
            revenue: trend.revenue || 0,
            profit: trend.profit || 0,
            orders: trend.orders || 0,
          })) || [],
          categoryDistribution: categoryStats?.map((cat, index) => ({
            name: cat._id || 'Unknown',
            value: cat.count || 0,
            color: getColorForIndex(index),
          })) || [],
          recentActivities: recentActivity?.map(activity => ({
            description: formatActivityDescription(activity),
            user: activity.performedBy?.fullName || activity.performedBy?.username || 'System',
            time: formatTimeAgo(activity.timestamp),
            type: activity.action?.toLowerCase() || 'update',
          })) || [],
          topSellingItems: topSellingItems || [],
        };

        console.log('Transformed data:', transformedData);
        console.log('=== END FRONTEND DASHBOARD DEBUG ===');

        setDashboardData(transformedData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      showError?.(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get consistent colors for categories
  const getColorForIndex = (index) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#6B7280'];
    return colors[index % colors.length];
  };

  // Helper function to format activity descriptions
  const formatActivityDescription = (activity) => {
    const action = activity.action || '';
    const resource = activity.resource || '';
    const details = activity.details || {};

    switch (action) {
      case 'CREATE':
        return `Created ${resource.toLowerCase()} ${details.itemName || details.skuCode || ''}`;
      case 'UPDATE':
        return `Updated ${resource.toLowerCase()} ${details.itemName || details.skuCode || ''}`;
      case 'DELETE':
        return `Deleted ${resource.toLowerCase()} ${details.itemName || details.skuCode || ''}`;
      default:
        return `${action} on ${resource.toLowerCase()}`;
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    console.log('Dashboard component mounted, calling fetchDashboardData...');
    fetchDashboardData();
  }, []);

  const data = dashboardData || {};
  const stats = data.stats || {};
  const salesTrend = data.salesTrend || [];
  const categoryDistribution = data.categoryDistribution || [];
  const recentActivities = data.recentActivities || [];

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name || user?.username || 'Admin'}!
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              Here's what's happening with your business today.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && !dashboardData && (
        <Card className="p-6">
          <ErrorState message={error} onRetry={fetchDashboardData} />
        </Card>
      )}

      {/* Stats Cards Grid - Sales Data (RouteStar) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Sales Analytics (RouteStar)
          {stats.dataSource === 'automation' && (
            <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
              Automation Data
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`}
            changeType={stats.revenueChange >= 0 ? 'positive' : 'negative'}
            icon={DollarSign}
            loading={loading}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders?.toLocaleString() || '0'}
            change={`${stats.ordersChange > 0 ? '+' : ''}${stats.ordersChange}%`}
            changeType={stats.ordersChange >= 0 ? 'positive' : 'negative'}
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems?.toLocaleString() || '0'}
            change={`${stats.lowStockChange}%`}
            changeType={stats.lowStockChange >= 0 ? 'positive' : 'negative'}
            icon={AlertTriangle}
            loading={loading}
          />
          <StatCard
            title="Profit Margin"
            value={`${stats.profitMargin}%`}
            change={`${stats.profitMarginChange > 0 ? '+' : ''}${stats.profitMarginChange}%`}
            changeType={stats.profitMarginChange >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            loading={loading}
          />
        </div>
      </div>

      {/* Stats Cards Grid - Purchase Data (CustomerConnect) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Purchase Analytics (CustomerConnect)
          {stats.dataSource === 'automation' && (
            <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Automation Data
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="Total Purchase Amount"
            value={formatCurrency(stats.totalPurchaseAmount)}
            icon={ShoppingCart}
            loading={loading}
          />
          <StatCard
            title="Purchase Orders"
            value={stats.totalPurchaseOrders?.toLocaleString() || '0'}
            icon={Package}
            loading={loading}
          />
          <StatCard
            title="Avg Purchase Value"
            value={formatCurrency(stats.avgPurchaseValue)}
            icon={DollarSign}
            loading={loading}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue & Profit Trend */}
        <Card className="p-6">
          {loading ? (
            <ChartSkeleton />
          ) : salesTrend.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Revenue & Profit Trend</h2>
                <p className="text-sm text-gray-500">Last {salesTrend.length} months performance</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Revenue"
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Profit"
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </Card>

        {/* Category Distribution Chart */}
        <Card className="p-6">
          {loading ? (
            <ChartSkeleton />
          ) : categoryDistribution.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
                <p className="text-sm text-gray-500">Inventory by category</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value) => [value, 'Items']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{category.name} ({category.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats or Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Selling Items
              {stats.dataSource === 'automation' && (
                <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
                  Automation Data
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">Based on actual sales revenue (last 180 days)</p>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : data.topSellingItems && data.topSellingItems.length > 0 ? (
            <div className="space-y-3">
              {data.topSellingItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.itemName}</p>
                    <p className="text-xs text-gray-500">{item.skuCode}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                    <p className="text-xs text-gray-500">
                      Sold: {item.quantity} {item.orderCount && `(${item.orderCount} orders)`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Common tasks</p>
          </div>
          <QuickActions />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest actions and updates</p>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <RecentActivityTable activities={recentActivities} loading={loading} />
      </Card>
    </div>
  );
};

export default Dashboard;
