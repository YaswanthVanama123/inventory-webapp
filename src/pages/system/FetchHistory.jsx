import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import fetchHistoryService from '../../services/fetchHistoryService';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const FetchHistory = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [selectedFetch, setSelectedFetch] = useState(null);
  const [activeFetches, setActiveFetches] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('7');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [sourceFilter, statusFilter, daysFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const params = {
        source: sourceFilter !== 'all' ? sourceFilter : null,
        status: statusFilter !== 'all' ? statusFilter : null,
        days: daysFilter !== 'all' ? daysFilter : null,
        limit: 100,
        page: 1
      };

      const data = await fetchHistoryService.getPageData(params);

      setHistory(data?.history || []);
      setActiveFetches(data?.activeFetches || []);
      setStatistics(data?.summary || null);

      // Auto-select first fetch if none selected
      if (!selectedFetch && data?.history?.length > 0) {
        setSelectedFetch(data.history[0]);
      }
    } catch (error) {
      console.error('Error loading fetch history:', error);
      showError('Failed to load fetch history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getSourceLabel = (source, fetchType) => {
    // Customer Connect always shows as Orders
    if (source === 'customer_connect') {
      return 'Orders';
    }

    // RouteStar Invoices shows based on fetch type
    if (source === 'routestar_invoices') {
      if (fetchType === 'pending' || fetchType === 'pending_with_details') {
        return 'Pending Invoices';
      } else if (fetchType === 'closed' || fetchType === 'closed_with_details') {
        return 'Closed Invoices';
      } else {
        return 'Invoices';
      }
    }

    // RouteStar Items
    if (source === 'routestar_items') {
      return 'Items';
    }

    return source;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <ClockIcon className="w-4 h-4 text-amber-500 animate-spin" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'in_progress':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getStageData = (fetch) => {
    const stages = [];
    const totalDuration = fetch.duration || 0;

    // Stage 1: Initialization
    stages.push({
      name: 'Initialize',
      duration: totalDuration * 0.05,
      status: fetch.status === 'failed' ? 'failed' : 'completed'
    });

    // Stage 2: Data Fetch
    stages.push({
      name: 'Fetch Data',
      duration: totalDuration * 0.40,
      status: fetch.status === 'failed' && !fetch.results?.totalFetched ? 'failed' : 'completed'
    });

    // Stage 3: Processing
    stages.push({
      name: 'Process',
      duration: totalDuration * 0.35,
      status: fetch.status === 'failed' ? 'failed' : 'completed'
    });

    // Stage 4: Database Update
    stages.push({
      name: 'Database',
      duration: totalDuration * 0.15,
      status: fetch.status
    });

    // Stage 5: Finalize
    stages.push({
      name: 'Finalize',
      duration: totalDuration * 0.05,
      status: fetch.status
    });

    return stages;
  };

  const filteredHistory = history.filter(fetch => {
    const matchesSearch = searchTerm === '' ||
      getSourceLabel(fetch.source, fetch.fetchType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      fetch._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && history.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fetch History
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {statistics && `${statistics.totalCompleted + statistics.totalFailed} operations • ${statistics.successRate}% success rate`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUpIcon className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              variant="secondary"
              onClick={loadData}
              size="sm"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Sources</option>
                  <option value="customer_connect">Customer Connect</option>
                  <option value="routestar_invoices">RouteStar Invoices</option>
                  <option value="routestar_items">RouteStar Items</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Period
                </label>
                <select
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Builds List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Builds List */}
          <div className="flex-1 overflow-y-auto">
            {/* Active Fetches */}
            {activeFetches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                  Active
                </div>
                {activeFetches.map((fetch) => (
                  <button
                    key={fetch._id}
                    onClick={() => setSelectedFetch(fetch)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                      selectedFetch?._id === fetch._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fetch.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getSourceLabel(fetch.source, fetch.fetchType)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(fetch.startedAt).toLocaleTimeString()}
                        </div>
                        {fetch.user && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {fetch.user.fullName || fetch.user.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Historical Fetches */}
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                History
              </div>
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No fetch history found
                </div>
              ) : (
                filteredHistory.map((fetch, index) => (
                  <button
                    key={fetch._id}
                    onClick={() => setSelectedFetch(fetch)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                      selectedFetch?._id === fetch._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fetch.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getSourceLabel(fetch.source, fetch.fetchType)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(fetch.startedAt).toLocaleString()}
                        </div>
                        {fetch.user && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {fetch.user.fullName || fetch.user.username}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(fetch.duration || fetch.calculatedDuration)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Stage View */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-900">
          {selectedFetch ? (
            <div className="p-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      {getStatusIcon(selectedFetch.status)}
                      {getSourceLabel(selectedFetch.source, selectedFetch.fetchType)}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Started: {new Date(selectedFetch.startedAt).toLocaleString()}
                      {selectedFetch.user && (
                        <span className="ml-3">
                          • By: {selectedFetch.user.fullName || selectedFetch.user.username}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border ${getStatusColor(selectedFetch.status)}`}>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedFetch.status.toUpperCase().replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDuration(selectedFetch.duration || selectedFetch.calculatedDuration)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Fetched</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFetch.results?.totalFetched || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedFetch.results?.totalFetched > 0
                        ? Math.round(((selectedFetch.results.totalFetched - (selectedFetch.results.failed || 0)) / selectedFetch.results.totalFetched) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage View */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Stage View
                </h3>

                {/* Stage Timeline */}
                <div className="space-y-4">
                  {getStageData(selectedFetch).map((stage, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stage.name}
                      </div>
                      <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center">
                        <div
                          className={`h-full flex items-center justify-center text-white text-xs font-semibold transition-all ${
                            stage.status === 'completed'
                              ? 'bg-emerald-500'
                              : stage.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${(stage.duration / (selectedFetch.duration || 1)) * 100}%`, minWidth: '60px' }}
                        >
                          {formatDuration(stage.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Average Times (if available) */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total run time: {formatDuration(selectedFetch.duration || selectedFetch.calculatedDuration)}
                  </div>
                </div>
              </div>

              {/* Results Details */}
              {selectedFetch.results && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Results
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-1">Created</div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {selectedFetch.results.created || 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Updated</div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedFetch.results.updated || 0}
                      </div>
                    </div>
                    {selectedFetch.results.detailsSynced > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Details Synced</div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {selectedFetch.results.detailsSynced}
                        </div>
                      </div>
                    )}
                    {selectedFetch.results.failed > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <div className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</div>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {selectedFetch.results.failed}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {selectedFetch.errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Error Details
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                    {selectedFetch.errorMessage}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a fetch operation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetchHistory;
