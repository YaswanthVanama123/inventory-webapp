import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import quickBooksSyncService from '../../services/quickBooksSyncService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowPathIcon, PlayIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

const STATUS_VARIANTS = {
  pending: 'info',
  in_progress: 'warning',
  synced: 'success',
  failed: 'danger'
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  synced: 'Synced',
  failed: 'Failed'
};

const TYPE_LABELS = {
  stock_update: 'Stock Update',
  discrepancy_adjustment: 'Discrepancy'
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const QuickBooksSync = () => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, synced: 0, failed: 0, total: 0, lastSyncedAt: null });
  const [queue, setQueue] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResp, queueResp] = await Promise.all([
        quickBooksSyncService.getStats(),
        quickBooksSyncService.listQueue({ status: statusFilter || undefined, type: typeFilter || undefined, limit: 100 })
      ]);
      setStats(statsResp.data || statsResp);
      const queueData = queueResp.data || queueResp;
      setQueue(queueData.items || []);
    } catch (error) {
      showError('Failed to load QuickBooks sync data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTriggerSnapshot = async () => {
    try {
      setTriggering(true);
      const resp = await quickBooksSyncService.triggerSnapshot();
      const data = resp.data || resp;
      const snap = data.snapshot || {};
      const disc = data.discrepancies || {};
      showSuccess(`Enqueued ${snap.enqueued || 0} stock records, ${disc.enqueued || 0} discrepancies`);
      loadData();
    } catch (error) {
      showError('Failed to trigger snapshot: ' + error.message);
    } finally {
      setTriggering(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      setRetryingId(id);
      await quickBooksSyncService.retry(id);
      showSuccess('Record reset to pending');
      loadData();
    } catch (error) {
      showError('Failed to retry: ' + error.message);
    } finally {
      setRetryingId(null);
    }
  };

  if (loading && queue.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QuickBooks Sync</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stock + discrepancy adjustments queued for the QuickBooks Web Connector
          </p>
          {stats.lastSyncedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Last successful sync: {formatDateTime(stats.lastSyncedAt)} ({stats.lastSyncedItem})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadData} size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleTriggerSnapshot} disabled={triggering} size="sm">
            <PlayIcon className="w-4 h-4 mr-2" />
            {triggering ? 'Enqueuing...' : 'Enqueue Snapshot Now'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.in_progress}</p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Synced</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.synced}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="synced">Synced</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">All types</option>
            <option value="stock_update">Stock Update</option>
            <option value="discrepancy_adjustment">Discrepancy</option>
          </select>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No queue records matching filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Retries</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Enqueued</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Synced</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Error</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {queue.map((rec) => {
                  const qty = rec.type === 'discrepancy_adjustment'
                    ? (rec.quantityDifference > 0 ? `+${rec.quantityDifference}` : rec.quantityDifference)
                    : rec.newQuantity;
                  return (
                    <tr key={rec._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{rec.itemName}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{TYPE_LABELS[rec.type] || rec.type}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">{qty ?? '-'}</td>
                      <td className="px-4 py-2 text-sm">
                        <Badge variant={STATUS_VARIANTS[rec.status] || 'secondary'}>
                          {STATUS_LABELS[rec.status] || rec.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{rec.retries || 0}</td>
                      <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">{formatDateTime(rec.enqueuedAt)}</td>
                      <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">{formatDateTime(rec.syncedAt)}</td>
                      <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400 max-w-xs truncate" title={rec.lastError}>
                        {rec.lastError || '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {rec.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(rec._id)}
                            disabled={retryingId === rec._id}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                            title="Retry"
                          >
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The hourly cron snapshots current stock and queues any new Approved discrepancies as <strong>pending</strong> records here.</li>
            <li>The <strong>QuickBooks Web Connector</strong> installed inside the QB Desktop VM polls this server every 60 minutes, claims pending records, and submits them to QB Desktop as InventoryAdjustments.</li>
            <li>On success, records move to <strong>Synced</strong>. On QB-side errors, retries increment up to 5 then move to <strong>Failed</strong>; click the retry icon to reset.</li>
            <li>See <code>inventory-server/qbwc/README.md</code> for VM install steps.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default QuickBooksSync;
