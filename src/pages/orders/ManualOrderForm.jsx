import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { manualOrderService } from '../../services/manualOrderService';
import { manualPOItemService } from '../../services/manualPOItemService';
import { vendorService } from '../../services/vendorService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchableSelect from '../../components/common/SearchableSelect';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ManualOrderForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [vendors, setVendors] = useState([]);
  const [manualPOItems, setManualPOItems] = useState([]);

  // Form state
  const [selectedVendor, setSelectedVendor] = useState('');
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { sku: '', name: '', qty: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderNumData, vendorsData, itemsData] = await Promise.all([
        manualOrderService.getNextOrderNumber(),
        vendorService.getActiveVendors(),
        manualPOItemService.getActiveItems()
      ]);

      setOrderNumber(orderNumData.data.orderNumber);
      setVendors(vendorsData.vendors || []);
      setManualPOItems(itemsData.items || []);
    } catch (error) {
      showError('Failed to load form data: ' + error.message);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorChange = (vendorId) => {
    if (vendorId === 'new') {
      setShowNewVendorForm(true);
      setSelectedVendor('');
    } else {
      setShowNewVendorForm(false);
      setSelectedVendor(vendorId);
    }
  };

  const handleNewVendorChange = (e) => {
    const { name, value } = e.target;
    setNewVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewVendor = async () => {
    if (!newVendor.name.trim()) {
      showError('Vendor name is required');
      return;
    }

    try {
      const response = await vendorService.createVendor(newVendor);
      showSuccess('Vendor created successfully');

      // Reload vendors and select the new one
      const vendorsData = await vendorService.getActiveVendors();
      setVendors(vendorsData.vendors || []);
      setSelectedVendor(response.data._id);
      setShowNewVendorForm(false);
      setNewVendor({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      showError('Failed to create vendor: ' + error.message);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If SKU changed, auto-fill name
    if (field === 'sku') {
      const item = manualPOItems.find(i => i._id === value);
      if (item) {
        newItems[index].name = item.name;
        newItems[index].sku = item.sku;
      }
    }

    // Recalculate line total
    if (field === 'qty' || field === 'unitPrice') {
      const qty = parseFloat(newItems[index].qty) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].lineTotal = qty * unitPrice;
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { sku: '', name: '', qty: 1, unitPrice: 0, lineTotal: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      showError('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedVendor && !showNewVendorForm) {
      showError('Please select a vendor');
      return;
    }

    if (showNewVendorForm && !newVendor.name.trim()) {
      showError('Please enter vendor name or select existing vendor');
      return;
    }

    if (!orderDate) {
      showError('Order date is required');
      return;
    }

    const validItems = items.filter(item => item.sku && item.qty > 0);
    if (validItems.length === 0) {
      showError('Please add at least one item with valid SKU and quantity');
      return;
    }

    try {
      setSubmitting(true);

      let vendorData;
      if (showNewVendorForm) {
        // Create vendor first
        const vendorResponse = await vendorService.createVendor(newVendor);
        const vendor = await vendorService.getVendorById(vendorResponse.data._id);
        vendorData = vendor.data;
      } else {
        // Get selected vendor
        const vendor = await vendorService.getVendorById(selectedVendor);
        vendorData = vendor.data;
      }

      // Prepare order data
      const orderData = {
        vendor: {
          name: vendorData.name,
          email: vendorData.email || '',
          phone: vendorData.phone || '',
          address: vendorData.address || ''
        },
        orderDate,
        items: validItems.map(item => ({
          sku: item.sku,
          name: item.name,
          qty: parseFloat(item.qty),
          unitPrice: parseFloat(item.unitPrice)
        })),
        notes
      };

      await manualOrderService.createManualOrder(orderData);
      showSuccess('Manual order created successfully and stock processed');
      navigate('/orders');
    } catch (error) {
      showError(error.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Manual Order
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            Add a purchase order from a third-party vendor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Order Information
          </h2>

          {/* Order Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Order Number
            </label>
            <Input
              type="text"
              value={orderNumber}
              disabled
              className="w-full bg-slate-100 dark:bg-gray-700"
            />
          </div>

          {/* Vendor Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Vendor *
            </label>
            {!showNewVendorForm ? (
              <SearchableSelect
                options={[
                  ...vendors,
                  { _id: 'new', name: '+ Add New Vendor' }
                ]}
                value={selectedVendor}
                onChange={handleVendorChange}
                placeholder="Select vendor..."
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option._id}
              />
            ) : (
              <div className="space-y-3 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  New Vendor Details
                </h3>
                <Input
                  type="text"
                  name="name"
                  placeholder="Vendor Name *"
                  value={newVendor.name}
                  onChange={handleNewVendorChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newVendor.email}
                  onChange={handleNewVendorChange}
                />
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={newVendor.phone}
                  onChange={handleNewVendorChange}
                />
                <Input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={newVendor.address}
                  onChange={handleNewVendorChange}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveNewVendor}
                    variant="primary"
                    size="sm"
                  >
                    Save Vendor
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowNewVendorForm(false);
                      setNewVendor({ name: '', email: '', phone: '', address: '' });
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Order Date *
            </label>
            <Input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full"
            />
          </div>
        </div>

        {/* Items Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Order Items
            </h2>
            <Button
              type="button"
              onClick={handleAddItem}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-slate-200 dark:border-gray-700 rounded-lg"
              >
                {/* SKU Selection */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">
                    Item *
                  </label>
                  <SearchableSelect
                    options={manualPOItems}
                    value={item.sku ? manualPOItems.find(i => i.sku === item.sku)?._id : ''}
                    onChange={(value) => handleItemChange(index, 'sku', value)}
                    placeholder="Select item..."
                    getOptionLabel={(option) => `${option.sku} - ${option.name}`}
                    getOptionValue={(option) => option._id}
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    required
                  />
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">
                    Unit Price *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    required
                  />
                </div>

                {/* Line Total */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1">
                    Line Total
                  </label>
                  <Input
                    type="text"
                    value={`$${item.lineTotal.toFixed(2)}`}
                    disabled
                    className="bg-slate-100 dark:bg-gray-700"
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                    disabled={items.length === 1}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-gray-700">
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-gray-400">Order Total</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Notes (Optional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this order..."
            rows="4"
            className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => navigate('/orders')}
            variant="secondary"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualOrderForm;
