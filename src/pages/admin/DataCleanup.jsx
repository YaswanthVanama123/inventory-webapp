import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import dataPurgeService, { PURGE_CONFIRM_PHRASE } from '../../services/dataPurgeService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UnauthorizedPage from '../../components/common/UnauthorizedPage';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/solid';

const GROUP_ORDER = ['Orders', 'Operations', 'Stock', 'Synced Data', 'Master Data', 'System'];

const DataCleanup = () => {
  const { showSuccess, showError, showWarning } = useContext(ToastContext);
  const { isAdmin } = useContext(AuthContext);

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [selected, setSelected] = useState(new Set());
  // { mode: 'single' | 'bulk', type?: object }
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await dataPurgeService.getTypes();
      setTypes(data.types || []);
    } catch (error) {
      showError('Failed to load data types: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadTypes();
  }, [isAdmin]);

  const grouped = useMemo(() => {
    const map = new Map();
    types.forEach((type) => {
      if (!map.has(type.group)) map.set(type.group, []);
      map.get(type.group).push(type);
    });
    return Array.from(map.entries()).sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0])
    );
  }, [types]);

  const totalRecords = types.reduce((sum, type) => sum + type.count, 0);
  const selectedTypes = types.filter((type) => selected.has(type.key));
  const selectedRecords = selectedTypes.reduce((sum, type) => sum + type.count, 0);

  const toggleSelected = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleGroup = (groupTypes) => {
    const keys = groupTypes.map((t) => t.key);
    const allSelected = keys.every((key) => selected.has(key));
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => (allSelected ? next.delete(key) : next.add(key)));
      return next;
    });
  };

  const openConfirm = (mode, type = null) => {
    if (mode === 'bulk' && selectedTypes.length === 0) {
      showWarning('Select at least one data type first');
      return;
    }
    if (mode === 'single' && type.count === 0) {
      showWarning(`${type.label} is already empty`);
      return;
    }
    setConfirmText('');
    setConfirmTarget({ mode, type });
  };

  const closeConfirm = () => {
    setConfirmTarget(null);
    setConfirmText('');
  };

  const runPurge = async () => {
    if (!confirmTarget) return;
    try {
      setPurging(true);
      if (confirmTarget.mode === 'single') {
        const res = await dataPurgeService.purgeAll(confirmTarget.type.key);
        showSuccess(
          `Permanently deleted ${res?.data?.deleted ?? 0} ${confirmTarget.type.label} record(s)`
        );
      } else {
        const res = await dataPurgeService.purgeManyTypes(selectedTypes.map((t) => t.key));
        const failed = res?.data?.failed || [];
        if (failed.length > 0) {
          showError(`${failed.length} data type(s) failed to purge`);
        } else {
          showSuccess(`Permanently deleted ${res?.data?.totalDeleted ?? 0} record(s)`);
        }
        setSelected(new Set());
      }
      closeConfirm();
      loadTypes();
    } catch (error) {
      showError('Purge failed: ' + error.message);
    } finally {
      setPurging(false);
    }
  };

  if (!isAdmin) {
    return <UnauthorizedPage />;
  }
  if (loading) {
    return <LoadingSpinner />;
  }

  const confirmLabel =
    confirmTarget?.mode === 'single'
      ? `${confirmTarget.type.count} ${confirmTarget.type.label} record(s)`
      : `${selectedRecords} record(s) across ${selectedTypes.length} data type(s)`;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Cleanup</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Permanently remove production records. Admin only.
        </p>
      </div>

      <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div className="text-sm text-red-800 dark:text-red-300">
            <p className="font-semibold">These deletes cannot be undone.</p>
            <p className="mt-1">
              Records are removed from the database immediately — they do not go to Trash and
              there is no restore. Dependent records are removed with them: stock movements
              belonging to a purged order or checkout are deleted, and the affected stock
              summaries are rebuilt from whatever movements remain. Synced data
              (CustomerConnect / RouteStar) will come back on the next sync.
            </p>
          </div>
        </div>
      </div>

      <Card className="sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalRecords.toLocaleString()} total records across {types.length} data types
            </p>
            {selectedTypes.length > 0 && (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                {selectedRecords.toLocaleString()} record(s) selected for deletion
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={loadTypes}
              icon={<ArrowPathIcon className="w-5 h-5" />}
            >
              Refresh Counts
            </Button>
            <Button variant="ghost" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
              Clear Selection
            </Button>
            <Button
              variant="danger"
              onClick={() => openConfirm('bulk')}
              disabled={selectedTypes.length === 0 || purging}
              icon={<TrashIcon className="w-5 h-5" />}
            >
              Delete Selected Types ({selectedTypes.length})
            </Button>
          </div>
        </div>
      </Card>

      {grouped.map(([group, groupTypes]) => {
        const allSelected = groupTypes.every((type) => selected.has(type.key));
        return (
          <Card key={group}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group}</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleGroup(groupTypes)}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupTypes.map((type) => (
                    <tr
                      key={type.key}
                      className={selected.has(type.key) ? 'bg-red-50 dark:bg-red-900/10' : ''}
                    >
                      <td className="px-4 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={selected.has(type.key)}
                          onChange={() => toggleSelected(type.key)}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          aria-label={`Select ${type.label}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {type.description}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <span
                          className={`text-lg font-bold ${
                            type.count > 0
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {type.count.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">records</div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openConfirm('single', type)}
                          disabled={type.count === 0 || purging}
                          icon={<TrashIcon className="w-4 h-4" />}
                        >
                          Delete All
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      <Modal
        isOpen={Boolean(confirmTarget)}
        onClose={closeConfirm}
        title="Permanently delete data"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              You are about to permanently delete {confirmLabel}.
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              This cannot be undone. Related stock movements will be deleted and the affected
              stock summaries rebuilt.
            </p>
          </div>

          {confirmTarget?.mode === 'bulk' && (
            <ul className="max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {selectedTypes.map((type) => (
                <li key={type.key} className="flex justify-between">
                  <span>{type.label}</span>
                  <span className="font-mono">{type.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="font-mono font-bold">{PURGE_CONFIRM_PHRASE}</span> to confirm
            </label>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={PURGE_CONFIRM_PHRASE}
              fullWidth
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeConfirm} disabled={purging}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={runPurge}
              disabled={confirmText !== PURGE_CONFIRM_PHRASE || purging}
            >
              {purging ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataCleanup;
