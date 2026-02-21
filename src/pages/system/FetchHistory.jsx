import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import fetchHistoryService from '../../services/fetchHistoryService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const FetchHistory = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activeFetches, setActiveFetches] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 });

  // Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState(10);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [sourceFilter, statusFilter, daysFilter, pagination.page]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load each API call separately with better error handling
      const historyPromise = fetchHistoryService.getHistory({
        source: sourceFilter !== 'all' ? sourceFilter : null,
        status: statusFilter !== 'all' ? statusFilter : null,
        limit: pagination.limit,
        page: pagination.page,
        days: daysFilter
      }).catch(err => {
        console.error('History API error:', err);
        return { history: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } };
      });

      const activePromise = fetchHistoryService.getActiveFetches(
        sourceFilter !== 'all' ? sourceFilter : null
      ).catch(err => {
        console.error('Active fetches API error:', err);
        return { activeFetches: [] };
      });

      const statsPromise = fetchHistoryService.getStatistics(
        sourceFilter !== 'all' ? sourceFilter : null,
        daysFilter
      ).catch(err => {
        console.error('Statistics API error:', err);
        return { summary: { activeCount: 0, todayCount: 0, successRate: 0, totalCompleted: 0, totalFailed: 0 } };
      });

      const [historyData, activeData, statsData] = await Promise.all([
        historyPromise,
        activePromise,
        statsPromise
      ]);

      setHistory(historyData?.history || []);
      setPagination(historyData?.pagination || { total: 0, page: 1, limit: 50, pages: 0 });
      setActiveFetches(activeData?.activeFetches || []);
      setStatistics(statsData?.summary || null);
    } catch (error) {
      console.error('Error loading fetch history:', error);
      showError('Failed to load fetch history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFetch = async (id, source) => {
    if (!window.confirm('Are you sure you want to cancel this fetch operation?')) {
      return;
    }

    try {
      await fetchHistoryService.cancelFetch(id);
      showSuccess('Fetch operation cancelled');
      loadData();
    } catch (error) {
      showError('Failed to cancel fetch: ' + error.message);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getSourceLabel = (source) => {
    const labels = {
      'customer_connect': 'Customer Connect',
      'routestar_invoices': 'RouteStar Invoices',
      'routestar_items': 'RouteStar Items'
    };
    return labels[source] || source;
  };

  const getStatusVariant = (status) => {
    const variants = {
      'in_progress': 'warning',
      'completed': 'success',
      'failed': 'danger',
      'cancelled': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const getSourceColor = (source) => {
    const colors = {
      'customer_connect': 'text-blue-600 dark:text-blue-400',
      'routestar_invoices': 'text-emerald-600 dark:text-emerald-400',
      'routestar_items': 'text-purple-600 dark:text-purple-400'
    };
    return colors[source] || 'text-gray-600 dark:text-gray-400';
  };

  if (loading && history.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fetch History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all sync and fetch operations (last {daysFilter} days)
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={loadData}
          size="sm"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Active Fetches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Fetches</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{statistics.activeCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currently running
              </p>
            </div>
          </div>

          {/* Today's Fetches */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Today's Fetches</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{statistics.todayCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Syncs today
              </p>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{statistics.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {statistics.totalCompleted} completed, {statistics.totalFailed} failed
              </p>
            </div>
          </div>

          {/* Total Operations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Operations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.totalCompleted + statistics.totalFailed}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last {daysFilter} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Fetches Section */}
      {activeFetches.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Fetches ({activeFetches.length})
          </h2>
          <div className="space-y-3">
            {activeFetches.map((fetch) => (
              <div
                key={fetch._id}
                className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-500 animate-spin" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getSourceLabel(fetch.source)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fetch.fetchType} • Running for {formatDuration(fetch.currentDuration)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Started: {new Date(fetch.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelFetch(fetch._id, fetch.source)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source
            </label>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">All Sources</option>
              <option value="customer_connect">Customer Connect</option>
              <option value="routestar_invoices">RouteStar Invoices</option>
              <option value="routestar_items">RouteStar Items</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Period
            </label>
            <Select
              value={daysFilter}
              onChange={(e) => setDaysFilter(parseInt(e.target.value))}
            >
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="10">Last 10 days</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Fetch History ({pagination.total} records)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No fetch history found
                  </td>
                </tr>
              ) : (
                history.map((fetch) => (
                  <tr key={fetch._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${getSourceColor(fetch.source)}`}>
                        {getSourceLabel(fetch.source)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {fetch.fetchType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(fetch.status)}>
                        {fetch.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div>{new Date(fetch.startedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(fetch.startedAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDuration(fetch.duration || fetch.calculatedDuration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {fetch.results && (
                        <div className="text-xs space-y-1">
                          <div className="text-gray-600 dark:text-gray-400">
                            Fetched: <span className="font-semibold">{fetch.results.totalFetched || 0}</span>
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Created: <span className="font-semibold">{fetch.results.created || 0}</span>
                          </div>
                          <div className="text-blue-600 dark:text-blue-400">
                            Updated: <span className="font-semibold">{fetch.results.updated || 0}</span>
                          </div>
                          {fetch.results.deleted > 0 && (
                            <div className="text-orange-600 dark:text-orange-400">
                              Deleted: <span className="font-semibold">{fetch.results.deleted}</span>
                            </div>
                          )}
                          {fetch.results.failed > 0 && (
                            <div className="text-red-600 dark:text-red-400">
                              Failed: <span className="font-semibold">{fetch.results.failed}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {fetch.errorMessage ? (
                        <span className="text-red-600 dark:text-red-400 truncate max-w-xs block" title={fetch.errorMessage}>
                          {fetch.errorMessage}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                      return <span key={page} className="px-2 py-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FetchHistory;
