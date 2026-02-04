import { useState, useContext, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import { DollarSign, TrendingUp } from 'lucide-react';

const AddPurchaseModal = ({ isOpen, onClose, inventoryItem, onSuccess }) => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    supplierName: inventoryItem?.supplier?.name || '',
    contactPerson: inventoryItem?.supplier?.contactPerson || '',
    supplierEmail: inventoryItem?.supplier?.email || '',
    supplierPhone: inventoryItem?.supplier?.phone || '',
    supplierAddress: inventoryItem?.supplier?.address || '',
    expiryDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Update form when inventory item changes
  useEffect(() => {
    if (inventoryItem) {
      setFormData(prev => ({
        ...prev,
        supplierName: inventoryItem?.supplier?.name || '',
        contactPerson: inventoryItem?.supplier?.contactPerson || '',
        supplierEmail: inventoryItem?.supplier?.email || '',
        supplierPhone: inventoryItem?.supplier?.phone || '',
        supplierAddress: inventoryItem?.supplier?.address || '',
      }));
    }
  }, [inventoryItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        purchaseDate: formData.purchaseDate,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined,
        supplier: {
          name: formData.supplierName,
          contactPerson: formData.contactPerson,
          email: formData.supplierEmail,
          phone: formData.supplierPhone,
          address: formData.supplierAddress,
        },
        expiryDate: formData.expiryDate || null,
        notes: formData.notes,
      };

      // Add the purchase (selling price is now included in the purchase data)
      await api.post(`/inventory/${inventoryItem._id}/purchases`, submitData);

      showSuccess('Purchase added successfully');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: '',
        purchasePrice: '',
        sellingPrice: '',
        supplierName: inventoryItem?.supplier?.name || '',
        contactPerson: inventoryItem?.supplier?.contactPerson || '',
        supplierEmail: inventoryItem?.supplier?.email || '',
        supplierPhone: inventoryItem?.supplier?.phone || '',
        supplierAddress: inventoryItem?.supplier?.address || '',
        expiryDate: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding purchase:', error);
      showError(error.message || 'Failed to add purchase');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (formData.quantity && formData.purchasePrice)
    ? (parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)).toFixed(2)
    : '0.00';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Purchase - ${inventoryItem?.itemName || ''}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={loading}>
            Add Purchase
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            error={errors.purchaseDate}
            required
            fullWidth
          />

          <Input
            label={`Quantity (${inventoryItem?.quantity?.unit || 'units'})`}
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            error={errors.quantity}
            required
            fullWidth
            min="0"
            step="0.01"
          />

          <Input
            label="Purchase Price (per unit)"
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.purchasePrice}
            required
            fullWidth
            min="0"
            step="0.01"
          />

          <div className="flex items-end">
            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Cost</span>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">${totalCost}</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Selling Price</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Selling Price (per unit)"
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.sellingPrice}
              required
              fullWidth
              min="0"
              step="0.01"
              helperText="Enter the price at which you'll sell this item"
            />

            {/* Profit Summary */}
            {formData.sellingPrice && formData.purchasePrice && (
              <div className="flex items-end">
                <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Profit per Unit</span>
                  </div>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    ${(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toFixed(2)}
                    <span className="text-sm font-normal text-green-600 ml-2">
                      ({formData.purchasePrice > 0 ? (((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(1) : 0}%)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Supplier Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              placeholder="Enter supplier name"
              error={errors.supplierName}
              required
              fullWidth
            />

            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person"
              fullWidth
            />

            <Input
              label="Email"
              type="email"
              name="supplierEmail"
              value={formData.supplierEmail}
              onChange={handleChange}
              placeholder="supplier@example.com"
              fullWidth
            />

            <Input
              label="Phone"
              type="tel"
              name="supplierPhone"
              value={formData.supplierPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              fullWidth
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              name="supplierAddress"
              value={formData.supplierAddress}
              onChange={handleChange}
              placeholder="Enter supplier address"
              rows={2}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Additional Details</h4>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Expiry Date (Optional)"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              fullWidth
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddPurchaseModal;
