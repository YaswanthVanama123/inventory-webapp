import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { PlusIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';

const TruckCheckoutForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    truckNumber: '',
    notes: '',
    checkoutDate: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState([
    { name: '', sku: '', quantity: 1, notes: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', sku: '', quantity: 1, notes: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      showError('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.employeeName.trim()) {
      showError('Employee name is required');
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.quantity > 0);
    if (validItems.length === 0) {
      showError('At least one valid item is required');
      return;
    }

    try {
      setLoading(true);

      const checkoutData = {
        ...formData,
        itemsTaken: validItems.map(item => ({
          name: item.name.trim(),
          sku: item.sku.trim() || undefined,
          quantity: parseInt(item.quantity),
          notes: item.notes.trim() || undefined
        })),
        checkoutDate: formData.checkoutDate ? new Date(formData.checkoutDate) : new Date()
      };

      await truckCheckoutService.createCheckout(checkoutData);

      showSuccess('Checkout created successfully');
      navigate('/truck-checkouts');
    } catch (error) {
      console.error('Create checkout error:', error);
      showError(error.response?.data?.message || 'Failed to create checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            New Truck Checkout
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Record items being taken in truck for delivery
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                placeholder="Enter employee name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee ID
              </label>
              <Input
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                placeholder="Enter employee ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Truck Number
              </label>
              <Input
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleInputChange}
                placeholder="Enter truck number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Checkout Date
              </label>
              <Input
                type="date"
                name="checkoutDate"
                value={formData.checkoutDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items Taken
            </h2>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addItem}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Item #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      SKU / Code
                    </label>
                    <Input
                      value={item.sku}
                      onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                      placeholder="Item SKU"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="lg:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Item Notes
                    </label>
                    <Input
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      placeholder="Optional notes for this item"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Notes
          </h2>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes about this checkout"
            rows={4}
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/truck-checkouts')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Create Checkout
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TruckCheckoutForm;
