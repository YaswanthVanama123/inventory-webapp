import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import dataPurgeService, { PURGE_CONFIRM_PHRASE } from '../../services/dataPurgeService';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { TrashIcon } from '@heroicons/react/24/solid';

const BulkPurgeBar = ({ type, label, selectedLabel = 'Delete Selected', selectedIds = [], onDone, className = '' }) => {
  const { showSuccess, showError } = useContext(ToastContext);
  const { isAdmin } = useContext(AuthContext);
  const [confirmMode, setConfirmMode] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [purging, setPurging] = useState(false);

  if (!isAdmin) return null;

  const closeConfirm = () => {
    setConfirmMode(null);
    setConfirmText('');
  };

  const runPurge = async () => {
    try {
      setPurging(true);
      if (confirmMode === 'selected') {
        const res = await dataPurgeService.purgeSelected(type, selectedIds);
        showSuccess(`Permanently deleted ${res?.data?.deleted ?? selectedIds.length} record(s)`);
      } else {
        const res = await dataPurgeService.purgeAll(type);
        showSuccess(`Permanently deleted all ${res?.data?.deleted ?? 0} record(s)`);
      }
      closeConfirm();
      onDone?.();
    } catch (error) {
      showError('Delete failed: ' + error.message);
    } finally {
      setPurging(false);
    }
  };

  const needsPhrase = confirmMode === 'all';
  const canConfirm = !purging && (!needsPhrase || confirmText === PURGE_CONFIRM_PHRASE);

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirmMode('selected')}
          disabled={selectedIds.length === 0 || purging}
          icon={<TrashIcon className="w-4 h-4" />}
        >
          {selectedLabel} ({selectedIds.length})
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setConfirmMode('all')}
          disabled={purging}
          icon={<TrashIcon className="w-4 h-4" />}
        >
          Delete All {label}
        </Button>
      </div>

      <Modal
        isOpen={Boolean(confirmMode)}
        onClose={closeConfirm}
        title="Permanently delete data"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {confirmMode === 'selected'
                ? `Permanently delete ${selectedIds.length} selected ${label} record(s)?`
                : `Permanently delete EVERY ${label} record?`}
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              This cannot be undone. Records do not go to Trash. Related stock movements are
              deleted too and the affected stock summaries are rebuilt.
            </p>
          </div>

          {needsPhrase && (
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
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeConfirm} disabled={purging}>
              Cancel
            </Button>
            <Button variant="danger" onClick={runPurge} disabled={!canConfirm}>
              {purging ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

BulkPurgeBar.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedLabel: PropTypes.string,
  selectedIds: PropTypes.arrayOf(PropTypes.string),
  onDone: PropTypes.func,
  className: PropTypes.string,
};

export default BulkPurgeBar;
