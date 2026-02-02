import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
  Activity, Users, Package, ShoppingCart, Trash2,
  Calendar, Filter, Download, Search, TrendingUp,
  BarChart3, PieChart
} from 'lucide-react';

const EmployeeActivities = () => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [searchParams, setSearchParams] = useSearchParams();

  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  });

  
  const [filters, setFilters] = useState({
    employeeId: '',
    action: '',
    resource: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
  });

  const [activeTab, setActiveTab] = useState('all'); 

  
  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, []);

  
  useEffect(() => {
    fetchActivities();
  }, [filters, activeTab]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.users);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/activities/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);

      let endpoint = '/activities';

      
      if (activeTab === 'sales') {
        endpoint = '/activities/sales';
      } else if (activeTab === 'stock') {
        endpoint = '/activities/stock';
      } else if (activeTab === 'deletions') {
        endpoint = '/activities/deletions';
      }

      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', pagination.limit);

      const response = await api.get(`${endpoint}?${params.toString()}`);

      const data = response.data;
      setActivities(data.activities || data.sales || data.deletions || []);
      setPagination(data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showError('Failed to fetch activities');
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, 
    }));
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      action: '',
      resource: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
    });
  };

  const getActionBadgeVariant = (action) => {
    switch (action) {
      case 'CREATE':
      case 'RESTORE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
      case 'LOGOUT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <Package className="w-4 h-4" />;
      case 'SALE':
        return <ShoppingCart className="w-4 h-4" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4" />;
      case 'RESTORE':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  
  const getAvailableActions = () => {
    if (!stats || !stats.actionBreakdown) return [];
    return stats.actionBreakdown.map(item => item._id).filter(Boolean);
  };

  
  const getAvailableResources = () => {
    if (!stats || !stats.resourceBreakdown) return [];
    return stats.resourceBreakdown.map(item => item._id).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Employee Activities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and monitor all employee actions and performance
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Activities</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalActivities}</h3>
                </div>
                <Activity className="w-12 h-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Most Active</p>
                  <h3 className="text-lg font-bold mt-1 truncate">
                    {stats.mostActiveEmployees[0]?.fullName || 'N/A'}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {stats.mostActiveEmployees[0]?.activityCount || 0} actions
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Top Action</p>
                  <h3 className="text-lg font-bold mt-1">
                    {stats.actionBreakdown[0]?._id || 'N/A'}
                  </h3>
                  <p className="text-purple-100 text-sm">
                    {stats.actionBreakdown[0]?.count || 0} times
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Top Resource</p>
                  <h3 className="text-lg font-bold mt-1">
                    {stats.resourceBreakdown[0]?._id || 'N/A'}
                  </h3>
                  <p className="text-orange-100 text-sm">
                    {stats.resourceBreakdown[0]?.count || 0} operations
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-orange-200" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Activities', icon: Activity },
              { id: 'sales', label: 'Sales', icon: ShoppingCart },
              { id: 'stock', label: 'Stock Changes', icon: Package },
              { id: 'deletions', label: 'Deletions', icon: Trash2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Employee
              </label>
              <select
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.username})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            {activeTab === 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Actions</option>
                  {getAvailableActions().map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Resource Filter */}
            {activeTab === 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Resource
                </label>
                <select
                  value={filters.resource}
                  onChange={(e) => handleFilterChange('resource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Resources</option>
                  {getAvailableResources().map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search in activity details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Activity Log
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pagination.total} total activities
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No activities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    getActionBadgeVariant(activity.action) === 'success' ? 'bg-green-100 dark:bg-green-900' :
                    getActionBadgeVariant(activity.action) === 'danger' ? 'bg-red-100 dark:bg-red-900' :
                    getActionBadgeVariant(activity.action) === 'info' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {getActionIcon(activity.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActionBadgeVariant(activity.action)}>
                          {activity.action}
                        </Badge>
                        <Badge variant="default">{activity.resource}</Badge>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.performedBy?.fullName || 'Unknown'}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({activity.performedBy?.username || 'unknown'})
                      </span>
                    </div>

                    {activity.details && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {JSON.stringify(activity.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && activities.length > 0 && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeeActivities;
