import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { showSuccess, showError, showInfo } = useContext(ToastContext);

  
  const [formData, setFormData] = useState({
    
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',

    
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',

    
    items: [],

    
    discountType: 'percentage', 
    discountValue: 0,
    taxRate: 0,
  });

  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  
  useEffect(() => {
    if (isEditMode) {
      loadInvoiceData();
    }
  }, [id]);

  
  useEffect(() => {
    loadInventoryItems();
  }, []);

  
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [formData]);

  
  useEffect(() => {
    if (!isEditMode) {
      loadDraft();
    }
  }, []);

  
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const loadInvoiceData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/invoices/${id}`);
      const data = response.data;

      setFormData({
        customerName: data.customer?.name || '',
        customerEmail: data.customer?.email || '',
        customerPhone: data.customer?.phone || '',
        customerAddress: data.customer?.address || '',
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
        notes: data.notes || '',
        items: data.items || [],
        discountType: data.discount?.type || 'percentage',
        discountValue: data.discount?.value || 0,
        taxRate: data.taxRate || 0,
      });
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to load invoice data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await api.get('/inventory');
      setInventoryItems(response.data || []);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
    }
  };

  const performSearch = () => {
    setSearchLoading(true);
    const query = searchQuery.toLowerCase();
    const results = inventoryItems.filter(
      (item) =>
        item.itemName?.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
    setSearchResults(results.slice(0, 10)); 
    setShowSearchDropdown(results.length > 0);
    setSearchLoading(false);
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('invoiceDraft', JSON.stringify(formData));
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('invoiceDraft');
      if (draft) {
        setFormData(JSON.parse(draft));
        setAutoSaveStatus('Draft loaded');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('invoiceDraft');
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
  };

  
  const handleAddItem = (inventoryItem) => {
    const newItem = {
      id: Date.now(), 
      inventoryId: inventoryItem._id,
      itemName: inventoryItem.itemName,
      sku: inventoryItem.sku,
      quantity: 1,
      unitPrice: inventoryItem.sellingPrice || 0,
      availableStock: inventoryItem.currentQuantity || 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value }
          : item
      ),
    }));
  };

  
  const calculateItemSubtotal = (item) => {
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'percentage') {
      return (subtotal * (formData.discountValue || 0)) / 100;
    }
    return formData.discountValue || 0;
  };

  const calculateTax = () => {
    const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount();
    return (subtotalAfterDiscount * (formData.taxRate || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  
  const validateForm = () => {
    const newErrors = {};

    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!isValidEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format (e.g., example@domain.com)';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    } else if (!isValidPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone format (minimum 10 digits)';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    } else if (formData.customerAddress.trim().length < 10) {
      newErrors.customerAddress = 'Please provide a complete address';
    }

    
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date(formData.invoiceDate)) {
      newErrors.dueDate = 'Due date must be on or after invoice date';
    }

    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        } else if (isNaN(item.quantity)) {
          newErrors[`item_${index}_quantity`] = 'Quantity must be a valid number';
        } else if (item.quantity > item.availableStock) {
          newErrors[`item_${index}_quantity`] = `Only ${item.availableStock} available in stock`;
        }

        if (item.unitPrice === '' || item.unitPrice === null) {
          newErrors[`item_${index}_unitPrice`] = 'Unit price is required';
        } else if (isNaN(item.unitPrice)) {
          newErrors[`item_${index}_unitPrice`] = 'Unit price must be a valid number';
        } else if (item.unitPrice < 0) {
          newErrors[`item_${index}_unitPrice`] = 'Unit price cannot be negative';
        }
      });
    }

    
    if (formData.discountValue < 0) {
      newErrors.discountValue = 'Discount cannot be negative';
    } else if (isNaN(formData.discountValue)) {
      newErrors.discountValue = 'Discount must be a valid number';
    } else if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Discount percentage cannot exceed 100%';
    }

    if (formData.taxRate === '' || formData.taxRate === null) {
      
    } else if (isNaN(formData.taxRate)) {
      newErrors.taxRate = 'Tax rate must be a valid number';
    } else if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  };

  
  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (!isDraft && !validateForm()) {
      showError('Please fix all validation errors before submitting');
      setAlert({
        type: 'danger',
        message: 'Please fix all validation errors before submitting',
      });
      window.scrollTo(0, 0);
      return;
    }

    setSubmitLoading(true);
    setAlert(null);

    try {
      const submitData = {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        },
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          inventoryId: item.inventoryId,
          itemName: item.itemName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        discount: {
          type: formData.discountType,
          value: formData.discountValue,
        },
        taxRate: formData.taxRate,
        status: isDraft ? 'draft' : 'pending',
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/invoices/${id}`, submitData);
      } else {
        response = await api.post('/invoices', submitData);
      }

      
      if (!isDraft) {
        clearDraft();
      }

      
      const successMessage = isDraft
        ? 'Invoice draft saved successfully'
        : isEditMode
        ? 'Invoice updated successfully'
        : 'Invoice created successfully';

      showSuccess(successMessage);
      setAlert({
        type: 'success',
        message: successMessage,
      });

      
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
    } catch (error) {
      const errorMessage = error.message || 'Failed to save invoice';
      showError(errorMessage);
      setAlert({
        type: 'danger',
        message: errorMessage,
      });
      window.scrollTo(0, 0);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, true);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      clearDraft();
      navigate('/invoices');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEditMode
              ? 'Update the invoice details'
              : 'Fill in the details to create a new invoice'}
          </p>
          {autoSaveStatus && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {autoSaveStatus}
            </p>
          )}
        </div>

        {}
        {alert && (
          <div className="mb-6">
            <Alert
              variant={alert.type}
              dismissible
              onDismiss={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </div>
        )}

        {}
        <form onSubmit={handleSubmit}>
          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  error={errors.customerName}
                  required
                  fullWidth
                />

                <Input
                  label="Email"
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                  error={errors.customerEmail}
                  required
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone"
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  error={errors.customerPhone}
                  required
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  placeholder="Enter customer address"
                  rows={3}
                  className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-800 dark:text-white ${
                    errors.customerAddress
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                  }`}
                />
                {errors.customerAddress && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.customerAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoice Details
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  error={errors.invoiceDate}
                  required
                  fullWidth
                />

                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={errors.dueDate}
                  required
                  fullWidth
                  min={formData.invoiceDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional notes or terms"
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Items
            </h2>

            {}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Search and Add Items
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Search by item name, SKU, or category..."
                  className="block w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.itemName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              SKU: {item.sku} | Category: {item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ${item.sellingPrice?.toFixed(2)}
                            </p>
                            <p className={`text-sm ${
                              item.currentQuantity > 10
                                ? 'text-green-600 dark:text-green-400'
                                : item.currentQuantity > 0
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              Stock: {item.currentQuantity}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.items && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.items}
                </p>
              )}
            </div>

            {}
            {formData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.itemName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              SKU: {item.sku}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Available: {item.availableStock}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="1"
                            max={item.availableStock}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className={`w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                              errors[`item_${index}_quantity`]
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {errors[`item_${index}_quantity`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="mr-1 text-gray-500 dark:text-gray-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                              className={`w-28 px-2 py-1 border rounded focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                                errors[`item_${index}_unitPrice`]
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                              }`}
                            />
                          </div>
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {errors[`item_${index}_unitPrice`]}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                          ${calculateItemSubtotal(item).toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Running Subtotal:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No items added yet. Search and add items above.
                </p>
              </div>
            )}
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Financial Summary
            </h2>

            <div className="space-y-6">
              {}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label={`Discount ${formData.discountType === 'percentage' ? '(%)' : '($)'}`}
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.discountValue}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    step={formData.discountType === 'percentage' ? '0.01' : '0.01'}
                    fullWidth
                  />
                </div>
              </div>

              {}
              <Input
                label="Tax Rate (%)"
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                placeholder="0"
                error={errors.taxRate}
                min="0"
                max="100"
                step="0.01"
                fullWidth
              />

              {}
              <div className="mt-8 space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>

                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-700 dark:text-gray-300">
                      Discount {formData.discountType === 'percentage' ? `(${formData.discountValue}%)` : ''}:
                    </span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -${calculateDiscount().toFixed(2)}
                    </span>
                  </div>
                )}

                {formData.taxRate > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="text-gray-700 dark:text-gray-300">
                      Tax ({formData.taxRate}%):
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${calculateTax().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xl font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitLoading}
              >
                Save as Draft
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={submitLoading}
                disabled={submitLoading}
              >
                {isEditMode ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
