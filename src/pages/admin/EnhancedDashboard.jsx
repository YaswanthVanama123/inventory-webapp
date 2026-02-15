import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Activity,
  Users,
  ShoppingCart,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">{entry.name}:</span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {typeof entry.value === 'number' && entry.name !== 'Orders'
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


const EnhancedStatCard = ({ title, value, subtitle, change, changeType, icon: Icon, trend, color = 'blue' }) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    indigo: 'from-indigo-500 to-indigo-600',
    red: 'from-red-500 to-red-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {change && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ChangeIcon className={`w-4 h-4 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`} />
              <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {change}
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          </div>
        )}

        {}
        {trend && (
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${color}-500)`} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={`var(--color-${color}-500)`} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={`var(--color-${color}-600)`}
                  fill={`url(#gradient-${color})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};


const EnhancedDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showError } = useContext(ToastContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  
  const fetchDashboardData = async () => {
    console.log('EnhancedDashboard: Fetching data from API...');
    setLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getDashboardData();
      console.log('EnhancedDashboard: API response:', response);

      if (response.success && response.data) {
        const { summary, categoryStats, recentActivity, topValueItems, salesTrend } = response.data;

        
        const transformedData = {
          kpis: {
            totalRevenue: summary.totalRevenue || 0,
            revenueChange: `${summary.revenueChange >= 0 ? '+' : ''}${summary.revenueChange}%`,
            totalOrders: summary.totalOrders || 0,
            ordersChange: `${summary.ordersChange >= 0 ? '+' : ''}${summary.ordersChange}%`,
            avgOrderValue: summary.avgOrderValue || 0,
            avgOrderChange: '+0%', 
            inventoryValue: summary.totalValue || 0,
            inventoryChange: '-0%', 
            lowStock: summary.lowStockCount || 0,
            lowStockChange: `${summary.lowStockChange >= 0 ? '+' : ''}${summary.lowStockChange}%`,
            profitMargin: summary.profitMargin || 0,
            marginChange: `${summary.profitMarginChange >= 0 ? '+' : ''}${summary.profitMarginChange}%`,
          },

          revenueTrend: salesTrend?.map(item => ({
            month: item.month,
            revenue: item.revenue || 0,
            orders: item.orders || 0,
            profit: item.profit || 0,
          })) || [],

          categoryPerformance: categoryStats?.map(cat => ({
            category: cat._id || cat.category || 'Unknown',
            sales: cat.count || 0,
            profit: 0, 
            inventory: cat.count || 0,
            satisfaction: 80, 
          })) || [],

          topProducts: topValueItems?.slice(0, 5).map(item => ({
            name: item.itemName,
            sales: item.value || 0,
            units: item.quantity || 0,
            margin: 0, 
          })) || [],

          
          inventoryTrend: [
            { date: 'Week 1', electronics: 0, clothing: 0, food: 0, books: 0 },
          ],
          salesByChannel: [
            { name: 'POS', value: 100, color: '#3B82F6' },
          ],
          stockTurnover: [],
        };

        console.log('EnhancedDashboard: Transformed data:', transformedData);
        setDashboardData(transformedData);
      }
    } catch (err) {
      console.error('EnhancedDashboard: Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard data');
      showError?.(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    console.log('EnhancedDashboard: Component mounted, fetching data...');
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  
  const data = dashboardData || {
    kpis: {
      totalRevenue: 0,
      revenueChange: '+0%',
      totalOrders: 0,
      ordersChange: '+0%',
      avgOrderValue: 0,
      avgOrderChange: '+0%',
      inventoryValue: 0,
      inventoryChange: '+0%',
      lowStock: 0,
      lowStockChange: '+0%',
      profitMargin: 0,
      marginChange: '+0%',
    },
    revenueTrend: [],
    inventoryTrend: [],
    topProducts: [],
    categoryPerformance: [],
    salesByChannel: [],
    stockTurnover: [],
  };

  
  const revenueTrendMini = [
    { value: 28 }, { value: 32 }, { value: 29 }, { value: 35 }, { value: 38 }, { value: 42 }, { value: 45 }
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-xl shadow-xl p-8 overflow-hidden">
        {}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.fullName || user?.username || 'Admin'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's your business performance overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-white font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Total Revenue"
          value={`$${data.kpis.totalRevenue.toLocaleString()}`}
          subtitle="This month"
          change={data.kpis.revenueChange}
          changeType="positive"
          icon={DollarSign}
          trend={revenueTrendMini}
          color="blue"
        />
        <EnhancedStatCard
          title="Total Orders"
          value={data.kpis.totalOrders.toLocaleString()}
          subtitle={`Avg: $${data.kpis.avgOrderValue}`}
          change={data.kpis.ordersChange}
          changeType="positive"
          icon={ShoppingCart}
          trend={revenueTrendMini}
          color="green"
        />
        <EnhancedStatCard
          title="Low Stock Items"
          value={data.kpis.lowStock}
          subtitle="Needs attention"
          change={data.kpis.lowStockChange}
          changeType="positive"
          icon={AlertTriangle}
          color="amber"
        />
        <EnhancedStatCard
          title="Profit Margin"
          value={`${data.kpis.profitMargin}%`}
          subtitle="Average margin"
          change={data.kpis.marginChange}
          changeType="positive"
          icon={Target}
          trend={revenueTrendMini}
          color="indigo"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Revenue & Profit Trend</h2>
            <p className="text-sm text-slate-500">Last 7 months performance</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600">+24.5% Growth</span>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueTrend}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={13}
              fontWeight={500}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={13}
              fontWeight={500}
              tickLine={false}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              name="Revenue"
              dot={{ fill: '#3B82F6', r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorProfit)"
              name="Profit"
              dot={{ fill: '#10B981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Top Selling Products</h2>
            <p className="text-sm text-slate-500">Best performers this month</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" stroke="#64748B" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="sales"
                fill="#3B82F6"
                radius={[0, 8, 8, 0]}
                name="Sales"
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sales by Channel</h2>
            <p className="text-sm text-slate-500">Distribution across platforms</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
                data={data.salesByChannel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                innerRadius={65}
                paddingAngle={0}
                dataKey="value"
              >
                {data.salesByChannel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {data.salesByChannel.map((channel, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: channel.color }}
                ></div>
                <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                <span className="text-xs text-slate-500 ml-auto">{channel.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Category Performance</h2>
            <p className="text-sm text-slate-500">Multi-dimensional analysis</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.categoryPerformance}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="category" stroke="#64748B" fontSize={12} />
              <PolarRadiusAxis stroke="#64748B" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Sales"
                dataKey="sales"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Profit"
                dataKey="profit"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
            </RadarChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Stock Turnover Rate</h2>
            <p className="text-sm text-slate-500">Inventory efficiency by category</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockTurnover}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="category" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => `${value}x`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="turnover"
                fill="#6366F1"
                radius={[8, 8, 0, 0]}
                name="Turnover Rate"
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/inventory/new')}
          className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <Package className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-white" />
          <h3 className="font-bold text-lg text-white">Add Item</h3>
          <p className="text-xs text-white mt-1">New inventory item</p>
        </button>

        <button
          onClick={() => navigate('/invoices/new')}
          className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-white" />
          <h3 className="font-bold text-lg text-white">New Invoice</h3>
          <p className="text-xs text-white mt-1">Create invoice</p>
        </button>

        <button
          onClick={() => navigate('/users')}
          className="group bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <Users className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-white" />
          <h3 className="font-bold text-lg text-white">Manage Users</h3>
          <p className="text-xs text-white mt-1">User accounts</p>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="group bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <BarChart3 className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform text-white" />
          <h3 className="font-bold text-lg text-white">View Reports</h3>
          <p className="text-xs text-white mt-1">Analytics</p>
        </button>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
