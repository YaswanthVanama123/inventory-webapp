import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';

const emptyLineItem = () => ({
  id: Date.now() + Math.random(),
  name: '',
  description: '',
  quantity: 1,
  rate: 0
});

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { user } = useContext(AuthContext);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceDate: today,
    dateCompleted: today,
    status: 'Closed',
    serviceNotes: '',
    invoiceMemo: '',
    paymentMethod: '',
    stop: '',
    lineItems: [emptyLineItem()]
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [routeStarItems, setRouteStarItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/routestar-items');
        const list = resp.data?.items || resp.data || resp.items || resp || [];
        setRouteStarItems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Could not load RouteStar items for autocomplete:', err.message);
      }
    })();
  }, []);

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLineItemChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(it =>
        it.id === id
          ? { ...it, [field]: field === 'quantity' || field === 'rate' ? (value === '' ? '' : Number(value)) : value }
          : it
      )
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));
  };

  const removeLineItem = (id) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.length > 1
        ? prev.lineItems.filter(it => it.id !== id)
        : prev.lineItems
    }));
  };

  const lineAmount = (it) => (Number(it.quantity) || 0) * (Number(it.rate) || 0);
  const subtotal = formData.lineItems.reduce((sum, it) => sum + lineAmount(it), 0);

  const validate = () => {
    const e = {};
    if (!formData.customerName.trim()) e.customerName = 'Customer name is required';
    if (!formData.invoiceDate) e.invoiceDate = 'Invoice date is required';
    if (formData.lineItems.length === 0) {
      e.lineItems = 'At least one item is required';
    } else {
      formData.lineItems.forEach((it, i) => {
        if (!it.name.trim()) e[`item_${i}_name`] = 'Required';
        if (!it.quantity || Number(it.quantity) <= 0) e[`item_${i}_quantity`] = 'Must be > 0';
        if (Number(it.rate) < 0) e[`item_${i}_rate`] = 'Cannot be negative';
      });
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setAlert({ type: 'danger', message: 'Please fix the highlighted fields' });
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setAlert(null);
    try {
      const payload = {
        customer: {
          name: formData.customerName.trim(),
          email: formData.customerEmail.trim(),
          phone: formData.customerPhone.trim()
        },
        invoiceDate: formData.invoiceDate,
        dateCompleted: formData.status === 'Closed' ? (formData.dateCompleted || formData.invoiceDate) : null,
        status: formData.status,
        serviceNotes: formData.serviceNotes,
        invoiceMemo: formData.invoiceMemo,
        paymentMethod: formData.paymentMethod,
        stop: formData.stop || undefined,
        lineItems: formData.lineItems.map(it => ({
          name: it.name.trim(),
          description: it.description || '',
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          sku: it.sku || ''
        }))
      };

      const resp = await api.post('/routestar/invoices/manual', payload);
      const createdNumber = resp.data?.invoiceNumber || resp.invoiceNumber || '';
      showSuccess(`Invoice ${createdNumber} created successfully`);
      setTimeout(() => {
        navigate(formData.status === 'Closed' ? '/invoices/routestar/closed' : '/invoices/routestar/pending');
      }, 800);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create invoice';
      showError(msg);
      setAlert({ type: 'danger', message: msg });
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard this invoice?')) {
      navigate('/invoices/routestar/closed');
    }
  };

  const truckNumber = user?.truckNumber || '—';
  const enteredBy = user?.fullName || user?.username || '—';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Invoice</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manual invoice — fields match the RouteStar format
          </p>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert variant={alert.type} dismissible onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top: customer + invoice meta side-by-side, like RouteStar detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="space-y-4">
                <Input
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleField}
                  placeholder="e.g. 7-Eleven - Fairfax"
                  error={errors.customerName}
                  required
                  fullWidth
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleField}
                    placeholder="customer@example.com"
                    fullWidth
                  />
                  <Input
                    label="Phone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleField}
                    placeholder="(555) 123-4567"
                    fullWidth
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Service Notes
                  </label>
                  <textarea
                    name="serviceNotes"
                    value={formData.serviceNotes}
                    onChange={handleField}
                    placeholder="Restroom Sani, etc."
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Invoice Memo
                  </label>
                  <textarea
                    name="invoiceMemo"
                    value={formData.invoiceMemo}
                    onChange={handleField}
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right column: read-only invoice details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase dark:text-gray-400 mb-1">
                    Entered By
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white font-medium">
                    {enteredBy}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase dark:text-gray-400 mb-1">
                    Assigned To (Truck / Route)
                  </label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white font-medium">
                    {truckNumber}
                  </div>
                  {!user?.truckNumber && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      No truck number assigned to your account — ask an admin to set it.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleField}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Closed">Closed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <Input
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleField}
                  error={errors.invoiceDate}
                  required
                  fullWidth
                />
                {formData.status === 'Closed' && (
                  <Input
                    label="Date Completed"
                    type="date"
                    name="dateCompleted"
                    value={formData.dateCompleted}
                    onChange={handleField}
                    fullWidth
                  />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Stop #"
                    name="stop"
                    type="number"
                    value={formData.stop}
                    onChange={handleField}
                    placeholder="—"
                    fullWidth
                  />
                  <Input
                    label="Payment"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleField}
                    placeholder="Cash / Card"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addLineItem}>
                + Add Item
              </Button>
            </div>
            {errors.lineItems && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errors.lineItems}</p>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Item Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300 w-24">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300 w-28">Rate</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300 w-28">Amount</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {formData.lineItems.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          list="routestar-items-list"
                          value={it.name}
                          onChange={(e) => handleLineItemChange(it.id, 'name', e.target.value)}
                          placeholder="Item name"
                          className={`w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white ${
                            errors[`item_${idx}_name`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleLineItemChange(it.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={it.quantity}
                          onChange={(e) => handleLineItemChange(it.id, 'quantity', e.target.value)}
                          className={`w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white ${
                            errors[`item_${idx}_quantity`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center">
                          <span className="text-gray-500 dark:text-gray-400 mr-1">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.rate}
                            onChange={(e) => handleLineItemChange(it.id, 'rate', e.target.value)}
                            className={`w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white ${
                              errors[`item_${idx}_rate`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right align-top font-medium text-gray-900 dark:text-white">
                        ${lineAmount(it).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => removeLineItem(it.id)}
                          disabled={formData.lineItems.length === 1}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-30"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total:
                    </td>
                    <td className="px-3 py-3 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${subtotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {routeStarItems.length > 0 && (
              <datalist id="routestar-items-list">
                {routeStarItems.slice(0, 200).map((it, i) => (
                  <option key={i} value={it.itemName || it.name} />
                ))}
              </datalist>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
