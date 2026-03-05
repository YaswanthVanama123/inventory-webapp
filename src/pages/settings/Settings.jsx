import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Settings = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [stockCutoffDate, setStockCutoffDate] = useState('');
  const [stockCutoffLoading, setStockCutoffLoading] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [thresholdLoading, setThresholdLoading] = useState(false);
  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsRes = await settingsService.getGeneralSettings();
      const cutoffData = settingsRes?.data?.stockCalculationCutoffDate || null;
      setStockCutoffDate(cutoffData ? new Date(cutoffData).toISOString().split('T')[0] : '');
      const thresholdData = settingsRes?.data?.lowStockThreshold || '';
      setLowStockThreshold(thresholdData?.toString() || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
      setStockCutoffDate('');
      setLowStockThreshold('');
      showError(error.message || 'Failed to load settings. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateStockCutoffDate = async () => {
    if (!stockCutoffDate) {
      showError('Please select a cutoff date');
      return;
    }
    setStockCutoffLoading(true);
    try {
      await settingsService.updateStockCutoffDate(stockCutoffDate);
      showSuccess('Stock calculation cutoff date updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error updating cutoff date:', error);
      showError(error.message || 'Failed to update cutoff date');
    } finally {
      setStockCutoffLoading(false);
    }
  };
  const handleUpdateLowStockThreshold = async () => {
    if (!lowStockThreshold || lowStockThreshold <= 0) {
      showError('Please enter a valid threshold value greater than 0');
      return;
    }
    setThresholdLoading(true);
    try {
      await settingsService.updateLowStockThreshold(parseInt(lowStockThreshold));
      showSuccess('Low stock threshold updated successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error updating threshold:', error);
      showError(error.message || 'Failed to update threshold');
    } finally {
      setThresholdLoading(false);
    }
  };
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-slate-600 dark:text-gray-400">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-600 dark:text-gray-400 mt-1">Manage system configuration</p>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Stock Calculation Cutoff Date</h3>
        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
          Set the date when you switched from the old system to the new checkout system.
          Invoices <strong>before</strong> this date will decrease stock (old behavior).
          Invoices <strong>after</strong> this date will NOT decrease stock (new checkout system).
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">How this works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Before cutoff date:</strong> Invoices decrease stock automatically (old system)</li>
                <li><strong>After cutoff date:</strong> Stock is decreased at checkout, invoices don't affect stock</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Cutoff Date
            </label>
            <Input
              type="date"
              value={stockCutoffDate}
              onChange={(e) => setStockCutoffDate(e.target.value)}
              className="w-full"
            />
            {stockCutoffDate && (
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                Current cutoff: <strong>{new Date(stockCutoffDate).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
          <Button
            onClick={handleUpdateStockCutoffDate}
            loading={stockCutoffLoading}
            disabled={!stockCutoffDate || stockCutoffLoading}
          >
            Update Cutoff Date
          </Button>
        </div>
      </div>
      {/* Low Stock Threshold Setting */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Low Stock Threshold</h3>
        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
          Set the quantity threshold for RouteStar items. Items with quantities <strong>below</strong> this value will be marked as "Low Stock" on the dashboard.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium mb-1">How this works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Items with quantity <strong>&lt; threshold</strong> will show as "Low Stock"</li>
                <li>Low Stock count appears on the dashboard</li>
                <li>Helps you identify items that need reordering</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Threshold Quantity
            </label>
            <Input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="e.g., 10"
              className="w-full"
            />
            {lowStockThreshold && (
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
                Items with quantity below <strong>{lowStockThreshold}</strong> will be marked as low stock
              </p>
            )}
          </div>
          <Button
            onClick={handleUpdateLowStockThreshold}
            loading={thresholdLoading}
            disabled={!lowStockThreshold || lowStockThreshold <= 0 || thresholdLoading}
          >
            Update Threshold
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Settings;
