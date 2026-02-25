import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Alert from '../common/Alert';

const StockUpdateForm = ({
  item,
  onSuccess,
  onCancel,
  standalone = false,
}) => {
  const [formData, setFormData] = useState({
    action: 'add',
    quantity: '',
    reason: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previewStock, setPreviewStock] = useState(item?.currentStock || 0);

  
  const actionConfig = {
    add: {
      label: 'Add Stock',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-700 dark:text-green-300',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    remove: {
      label: 'Remove Stock',
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-700 dark:text-red-300',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
    },
    set: {
      label: 'Set Stock',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  };

  const actionOptions = [
    { value: 'add', label: 'Add Stock' },
    { value: 'remove', label: 'Remove Stock' },
    { value: 'set', label: 'Set Stock' },
  ];

  
  useEffect(() => {
    const qty = parseInt(formData.quantity) || 0;
    const currentStock = item?.currentStock || 0;

    let newStock = currentStock;
    switch (formData.action) {
      case 'add':
        newStock = currentStock + qty;
        break;
      case 'remove':
        newStock = Math.max(0, currentStock - qty);
        break;
      case 'set':
        newStock = qty;
        break;
      default:
        break;
    }

    setPreviewStock(newStock);
  }, [formData.action, formData.quantity, item?.currentStock]);

  const validateForm = () => {
    const newErrors = {};
    const qty = parseInt(formData.quantity);

    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (qty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else if (!Number.isInteger(qty)) {
      newErrors.quantity = 'Quantity must be a whole number';
    }

    
    if (formData.action === 'remove' && qty > (item?.currentStock || 0)) {
      newErrors.quantity = `Cannot remove more than available stock (${item?.currentStock || 0})`;
    }

    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 3) {
      newErrors.reason = 'Reason must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    
    if (alert) {
      setAlert(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`/api/inventory/${item._id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: formData.action,
          quantity: parseInt(formData.quantity),
          reason: formData.reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update stock');
      }

      
      setAlert({
        variant: 'success',
        message: `Stock updated successfully! New stock level: ${data.data?.currentStock || previewStock}`,
      });

      
      setFormData({
        action: 'add',
        quantity: '',
        reason: '',
      });

      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(data.data);
        }, 1500);
      }
    } catch (error) {
      setAlert({
        variant: 'danger',
        message: error.message || 'Failed to update stock. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      action: 'add',
      quantity: '',
      reason: '',
    });
    setErrors({});
    setAlert(null);
    if (onCancel) {
      onCancel();
    }
  };

  const currentAction = actionConfig[formData.action];

  return (
    <div className={standalone ? 'max-w-2xl mx-auto p-4 sm:p-6' : ''}>
      {}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {item?.name || 'Item Name'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Stock:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {item?.currentStock || 0}
            </span>
          </div>
        </div>
        {item?.sku && (
          <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku}</p>
        )}
      </div>

      {}
      {alert && (
        <div className="mb-4">
          <Alert variant={alert.variant} dismissible onDismiss={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {}
      <form onSubmit={handleSubmit} className="space-y-5">
        {}
        <div>
          <Select
            label="Action"
            name="action"
            value={formData.action}
            onChange={handleChange}
            options={actionOptions}
            required
            fullWidth
          />
        </div>

        {}
        <div
          className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-all duration-200 ${currentAction.bgColor} ${currentAction.borderColor}`}
        >
          <div className={currentAction.textColor}>{currentAction.icon}</div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${currentAction.textColor}`}>
              {currentAction.label}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formData.action === 'add' && 'Increase inventory stock'}
              {formData.action === 'remove' && 'Decrease inventory stock'}
              {formData.action === 'set' && 'Set specific stock level'}
            </p>
          </div>
        </div>

        {}
        <div>
          <Input
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            error={errors.quantity}
            required
            fullWidth
            min="1"
            step="1"
          />
        </div>

        {}
        {formData.quantity && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  New Stock Level
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item?.currentStock || 0}
                  </span>
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <span
                    className={`text-2xl font-bold ${
                      previewStock > (item?.currentStock || 0)
                        ? 'text-green-600 dark:text-green-400'
                        : previewStock < (item?.currentStock || 0)
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {previewStock}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
                <p
                  className={`text-lg font-semibold ${
                    formData.action === 'add'
                      ? 'text-green-600 dark:text-green-400'
                      : formData.action === 'remove'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {formData.action === 'add' && '+'}
                  {formData.action === 'remove' && '-'}
                  {formData.action === 'set' && '='}
                  {formData.quantity || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {}
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            id="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Enter reason for stock update (e.g., received shipment, sold items, damaged goods, inventory correction)"
            rows={3}
            required
            className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-800 dark:text-white resize-none ${
              errors.reason
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
            }`}
            aria-invalid={errors.reason ? 'true' : 'false'}
            aria-describedby={errors.reason ? 'reason-error' : undefined}
          />
          {errors.reason && (
            <p id="reason-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.reason}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 3 characters. Be specific for better tracking.
          </p>
        </div>

        {}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
              fullWidth={!standalone}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant={
              formData.action === 'add'
                ? 'primary'
                : formData.action === 'remove'
                ? 'danger'
                : 'primary'
            }
            loading={loading}
            disabled={loading}
            fullWidth
            className={
              formData.action === 'set'
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
                : ''
            }
          >
            {loading ? 'Updating...' : `${currentAction.label}`}
          </Button>
        </div>
      </form>

      {}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Stock Update Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Use <strong>Add</strong> for new stock arrivals or returns</li>
              <li>Use <strong>Remove</strong> for sales, damages, or losses</li>
              <li>Use <strong>Set</strong> for inventory corrections or audits</li>
              <li>Always provide a clear reason for tracking purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

StockUpdateForm.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sku: PropTypes.string,
    currentStock: PropTypes.number.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  standalone: PropTypes.bool,
};

export default StockUpdateForm;
