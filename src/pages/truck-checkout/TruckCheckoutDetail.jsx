import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [invoiceType, setInvoiceType] = useState('closed');
  const [comparisonData, setComparisonData] = useState(null);
  const [checkWorkDone, setCheckWorkDone] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddInvoicesModal, setShowAddInvoicesModal] = useState(false);
  const [additionalInvoices, setAdditionalInvoices] = useState([]);
  const [additionalInput, setAdditionalInput] = useState('');
  const [additionalInvoiceType, setAdditionalInvoiceType] = useState('closed');
  const [additionalComparisonData, setAdditionalComparisonData] = useState(null);
  const [additionalCheckWorkDone, setAdditionalCheckWorkDone] = useState(false);
  useEffect(() => {
    loadCheckout();
  }, [id]);
  const loadCheckout = async () => {
    try {
      setLoading(true);
      const response = await truckCheckoutService.getCheckout(id);
      setCheckout(response.data);
    } catch (error) {
      console.error('Load checkout error:', error);
      showError('Failed to load checkout');
    } finally {
      setLoading(false);
    }
  };
  const handleCheckWork = async () => {
    if (invoiceNumbers.length === 0) {
      showError('Please enter at least one invoice number');
      return;
    }
    try {
      setActionLoading('check-work');
      const response = await truckCheckoutService.checkWork(id, invoiceNumbers, invoiceType);
      showSuccess('Invoices fetched successfully. Review the comparison below.');
      setComparisonData(response.data);
      setCheckWorkDone(true);
      loadCheckout(); 
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.duplicateCheckouts && errorData.duplicateCheckouts.length > 0) {
        const duplicates = errorData.duplicateCheckouts;
        const duplicateDetails = duplicates.map(dup =>
          `${dup.employeeName} (Checkout #${dup.checkoutId}): ${dup.invoices.join(', ')}`
        ).join('\n');
        showError(
          `${errorData.message}\n\nDuplicate invoices found in:\n${duplicateDetails}`,
          10000
        );
      } else {
        showError(errorData?.message || 'Failed to check work');
      }
    } finally {
      setActionLoading(null);
    }
  };
  const handleComplete = async () => {
    if (!checkWorkDone) {
      showError('Please click "Check Work" first to review the comparison');
      return;
    }
    try {
      setActionLoading('complete');
      await truckCheckoutService.completeCheckout(id, invoiceNumbers, invoiceType);
      showSuccess('Checkout completed successfully');
      setShowCompleteModal(false);
      setInvoiceNumbers([]);
      setCurrentInput('');
      setComparisonData(null);
      setCheckWorkDone(false);
      loadCheckout();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to complete checkout');
    } finally {
      setActionLoading(null);
    }
  };
  const handleAddInvoice = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !invoiceNumbers.includes(trimmedValue)) {
      setInvoiceNumbers([...invoiceNumbers, trimmedValue]);
    }
  };
  const handleRemoveInvoice = (invoiceToRemove) => {
    setInvoiceNumbers(invoiceNumbers.filter(inv => inv !== invoiceToRemove));
  };
  const handleInvoiceInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInvoice(currentInput);
      setCurrentInput('');
    } else if (e.key === 'Backspace' && currentInput === '' && invoiceNumbers.length > 0) {
      setInvoiceNumbers(invoiceNumbers.slice(0, -1));
    }
  };
  const handleInvoiceInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(p => p);
      parts.forEach(part => handleAddInvoice(part));
      setCurrentInput('');
    } else {
      setCurrentInput(value);
    }
  };
  const handleInvoiceInputBlur = () => {
    if (currentInput.trim()) {
      handleAddInvoice(currentInput);
      setCurrentInput('');
    }
  };
  const handleTally = async () => {
    try {
      setActionLoading('tally');
      const response = await truckCheckoutService.tallyCheckout(id);
      const { summary } = response.data;
      showSuccess(
        `Tally completed! Fetched ${summary.fetchedInvoices}/${summary.totalInvoices} invoices. ` +
        `${summary.matched} matched, ${summary.discrepancies} discrepancies.`
      );
      loadCheckout();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to tally checkout');
    } finally {
      setActionLoading(null);
    }
  };
  const handleProcessStock = async () => {
    try {
      setActionLoading('stock');
      const response = await truckCheckoutService.processStock(id);
      const { soldAdjustments, usedMovements, errors } = response.data;
      showSuccess(
        `Stock movements processed successfully! ` +
        `Added back ${soldAdjustments} sold items, tracked ${usedMovements} used items.` +
        (errors && errors.length > 0 ? ` ${errors.length} errors occurred.` : '')
      );
      loadCheckout();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to process stock');
    } finally {
      setActionLoading(null);
    }
  };
  const handleCancel = async () => {
    try {
      setActionLoading('cancel');
      await truckCheckoutService.cancelCheckout(id, cancelReason);
      showSuccess('Checkout cancelled');
      setShowCancelModal(false);
      setCancelReason('');
      loadCheckout();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to cancel checkout');
    } finally {
      setActionLoading(null);
    }
  };
  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    try {
      setActionLoading('delete');
      await truckCheckoutService.deleteCheckout(id);
      showSuccess('Checkout deleted successfully');
      navigate('/truck-checkouts');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete checkout');
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };
  const handleAddMoreInvoices = () => {
    setShowAddInvoicesModal(true);
    setAdditionalInvoices([]);
    setAdditionalInput('');
    setAdditionalInvoiceType(checkout.invoiceType || 'closed');
    setAdditionalComparisonData(null);
    setAdditionalCheckWorkDone(false);
  };
  const handleAddAdditionalInvoice = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !additionalInvoices.includes(trimmedValue)) {
      setAdditionalInvoices([...additionalInvoices, trimmedValue]);
    }
  };
  const handleRemoveAdditionalInvoice = (invoiceToRemove) => {
    setAdditionalInvoices(additionalInvoices.filter(inv => inv !== invoiceToRemove));
  };
  const handleAdditionalInvoiceInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddAdditionalInvoice(additionalInput);
      setAdditionalInput('');
    } else if (e.key === 'Backspace' && additionalInput === '' && additionalInvoices.length > 0) {
      setAdditionalInvoices(additionalInvoices.slice(0, -1));
    }
  };
  const handleAdditionalInvoiceInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',').map(p => p.trim()).filter(p => p);
      parts.forEach(part => handleAddAdditionalInvoice(part));
      setAdditionalInput('');
    } else {
      setAdditionalInput(value);
    }
  };
  const handleAdditionalInvoiceInputBlur = () => {
    if (additionalInput.trim()) {
      handleAddAdditionalInvoice(additionalInput);
      setAdditionalInput('');
    }
  };
  const handleCheckAdditionalWork = async () => {
    if (additionalInvoices.length === 0) {
      showError('Please enter at least one invoice number');
      return;
    }
    try {
      setActionLoading('check-additional-work');
      const allInvoices = [...(checkout.invoiceNumbers || []), ...additionalInvoices];
      const response = await truckCheckoutService.checkWork(id, allInvoices, additionalInvoiceType);
      showSuccess('Invoices fetched successfully. Review the comparison below.');
      setAdditionalComparisonData(response.data);
      setAdditionalCheckWorkDone(true);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.duplicateCheckouts && errorData.duplicateCheckouts.length > 0) {
        const duplicates = errorData.duplicateCheckouts;
        const duplicateDetails = duplicates.map(dup =>
          `${dup.employeeName} (Checkout #${dup.checkoutId}): ${dup.invoices.join(', ')}`
        ).join('\n');
        showError(`${errorData.message}\n\nDuplicate invoices found in:\n${duplicateDetails}`, 10000);
      } else {
        showError(errorData?.message || 'Failed to check work');
      }
    } finally {
      setActionLoading(null);
    }
  };
  const handleUpdateWithAdditionalInvoices = async () => {
    if (!additionalCheckWorkDone) {
      showError('Please click "Check Work" first to review the comparison');
      return;
    }
    try {
      setActionLoading('update-invoices');
      const allInvoices = [...(checkout.invoiceNumbers || []), ...additionalInvoices];
      await truckCheckoutService.completeCheckout(id, allInvoices, additionalInvoiceType);
      await truckCheckoutService.tallyCheckout(id);
      showSuccess('Checkout updated successfully with additional invoices and tally completed');
      setShowAddInvoicesModal(false);
      setAdditionalInvoices([]);
      setAdditionalInput('');
      setAdditionalComparisonData(null);
      setAdditionalCheckWorkDone(false);
      loadCheckout();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update checkout');
    } finally {
      setActionLoading(null);
    }
  };
  const getStatusBadge = (status) => {
    const config = {
      checked_out: { variant: 'info', label: 'Checked Out', icon: ClockIcon },
      completed: { variant: 'success', label: 'Completed', icon: CheckCircleIcon },
      cancelled: { variant: 'danger', label: 'Cancelled', icon: XCircleIcon }
    };
    const { variant, label, icon: Icon } = config[status] || config.checked_out;
    return (
      <Badge variant={variant} size="lg">
        <Icon className="w-5 h-5 mr-2" />
        {label}
      </Badge>
    );
  };
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!checkout) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Checkout Not Found">
          The requested checkout could not be found.
        </Alert>
        <Button onClick={() => navigate('/truck-checkouts')} className="mt-4">
          Back to Checkouts
        </Button>
      </div>
    );
  }
  const hasTally = checkout.tallyResults && checkout.tallyResults.discrepancies && checkout.tallyResults.discrepancies.length > 0;
  const canTally = checkout.status === 'completed' && checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0;
  const canProcessStock = hasTally && !checkout.stockProcessed;
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button
          onClick={() => navigate('/truck-checkouts')}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Checkouts
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {checkout.employeeName}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Truck: {checkout.truckNumber || 'N/A'}</span>
                <span className="text-slate-300">|</span>
                <span>{formatDate(checkout.checkoutDate)}</span>
              </p>
            </div>
          </div>
          {getStatusBadge(checkout.status)}
        </div>
      </div>

      {/* Actions Bar */}
      {checkout.status === 'checked_out' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={actionLoading === 'complete'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Add Invoices & Complete
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading === 'cancel'}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg border border-red-200 transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4" />
              Cancel Checkout
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors ml-auto disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
      {checkout.status === 'completed' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {!checkout.stockProcessed && checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 && (
              <button
                onClick={handleAddMoreInvoices}
                disabled={actionLoading === 'update-invoices'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Add More Invoices
              </button>
            )}
            {canTally && (
              <button
                onClick={handleTally}
                disabled={actionLoading === 'tally'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <CalculatorIcon className="w-4 h-4" />
                {hasTally ? 'Re-Tally' : 'Fetch & Tally Invoices'}
              </button>
            )}
            {canProcessStock && (
              <button
                onClick={handleProcessStock}
                disabled={actionLoading === 'stock'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <CubeIcon className="w-4 h-4" />
                Process Stock Movements
              </button>
            )}
            {checkout.stockProcessed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                <CheckCircleIcon className="w-4 h-4" />
                Stock Processed
              </span>
            )}
            <button
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors ml-auto disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
          {canProcessStock && (
            <p className="text-xs text-slate-500 mt-3 pl-1">
              Stock processing will adjust levels by adding back sold items and tracking used items separately.
            </p>
          )}
        </div>
      )}
      {checkout.status === 'cancelled' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <button
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Checkout
          </button>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee & Checkout Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-500" />
            Employee & Checkout Info
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt className="text-xs text-slate-500">Employee</dt>
              <dd className="text-sm font-semibold text-slate-900">{checkout.employeeName}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-xs text-slate-500">Employee ID</dt>
              <dd className="text-sm text-slate-900">{checkout.employeeId || '-'}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-xs text-slate-500">Route/Truck</dt>
              <dd className="text-sm font-medium text-slate-900">{checkout.truckNumber || '-'}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-xs text-slate-500">Checkout Date</dt>
              <dd className="text-sm text-slate-900">{formatDate(checkout.checkoutDate)}</dd>
            </div>
            {checkout.completedDate && (
              <div className="flex justify-between items-center">
                <dt className="text-xs text-slate-500">Completed</dt>
                <dd className="text-sm text-slate-900">{formatDate(checkout.completedDate)}</dd>
              </div>
            )}
          </dl>
          {checkout.notes && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <dt className="text-xs text-slate-500 mb-1">Notes</dt>
              <dd className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                {checkout.notes}
              </dd>
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-slate-500" />
            Invoices
          </h3>
          {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500">{checkout.invoiceNumbers.length} invoice(s)</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  checkout.invoiceType === 'closed'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {checkout.invoiceType || 'closed'}
                </span>
              </div>
              <div className="space-y-1.5">
                {checkout.invoiceNumbers.map((invNum, index) => (
                  <div key={index} className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 font-mono">
                    {invNum}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No invoices yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Taken */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <CubeIcon className="w-4 h-4 text-slate-500" />
            Items Taken ({checkout.itemName ? '1' : checkout.itemsTaken?.length || 0})
          </h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Total Qty: {checkout.itemName ? checkout.quantityTaking : checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {checkout.itemName ? (
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{checkout.itemName}</p>
                {checkout.notes && <p className="text-xs text-slate-500 mt-0.5">{checkout.notes}</p>}
              </div>
              <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                x{checkout.quantityTaking}
              </span>
            </div>
          ) : (
            checkout.itemsTaken?.map((item, index) => (
              <div key={index} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.sku && <span className="text-xs text-slate-500">SKU: {item.sku}</span>}
                    {item.notes && <span className="text-xs text-slate-400">• {item.notes}</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                  x{item.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Tally Results */}
      {hasTally && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CalculatorIcon className="w-4 h-4 text-slate-500" />
              Tally Results
            </h3>
          </div>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Taken</p>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {checkout.tallyResults.discrepancies?.reduce((sum, item) => sum + item.quantityTaken, 0) || 0}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Sold</p>
              <p className="text-xl font-bold text-green-700 mt-1">
                {checkout.tallyResults.discrepancies?.reduce((sum, item) => sum + item.quantitySold, 0) || 0}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Used</p>
              <p className="text-xl font-bold text-orange-700 mt-1">
                {(checkout.tallyResults.discrepancies?.reduce((sum, item) => sum + item.quantityTaken, 0) || 0) -
                 (checkout.tallyResults.discrepancies?.reduce((sum, item) => sum + item.quantitySold, 0) || 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Issues</p>
              <p className="text-xl font-bold text-purple-700 mt-1">
                {checkout.tallyResults.discrepancies?.filter(d => d.status !== 'matched').length || 0}
              </p>
            </div>
          </div>
          {/* Item Comparison */}
          {checkout.tallyResults.discrepancies && checkout.tallyResults.discrepancies.length > 0 && (
            <div className="border-t border-slate-200">
              <div className="px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Item Comparison
              </div>
              <div className="divide-y divide-slate-100">
                {checkout.tallyResults.discrepancies.map((item, index) => (
                  <div key={index} className={`px-5 py-3 flex items-center justify-between ${item.status !== 'matched' ? 'bg-amber-50/50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                      {item.sku && <p className="text-xs text-slate-500">{item.sku}</p>}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center w-12">
                        <div className="text-xs text-slate-500">Taken</div>
                        <div className="font-medium">{item.quantityTaken}</div>
                      </div>
                      <div className="text-center w-12">
                        <div className="text-xs text-slate-500">Sold</div>
                        <div className="font-medium text-green-600">{item.quantitySold}</div>
                      </div>
                      <div className="text-center w-12">
                        <div className="text-xs text-slate-500">Used</div>
                        <div className={`font-medium ${item.difference > 0 ? 'text-orange-600' : 'text-slate-600'}`}>
                          {item.difference > 0 ? item.difference : 0}
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        {item.status === 'matched' && (
                          <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Matched</span>
                        )}
                        {item.status === 'excess' && (
                          <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Returns</span>
                        )}
                        {item.status === 'shortage' && (
                          <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">Shortage</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          if (!actionLoading) {
            setShowCompleteModal(false);
            setInvoiceNumbers([]);
            setCurrentInput('');
            setComparisonData(null);
            setCheckWorkDone(false);
          }
        }}
        title={checkWorkDone ? "Review & Complete Checkout" : "Add Invoice Numbers & Complete"}
        size={checkWorkDone ? "xl" : "lg"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCompleteModal(false);
                setInvoiceNumbers([]);
                setCurrentInput('');
                setComparisonData(null);
                setCheckWorkDone(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            {!checkWorkDone ? (
              <Button
                variant="secondary"
                onClick={handleCheckWork}
                loading={actionLoading === 'check-work'}
                disabled={invoiceNumbers.length === 0}
              >
                Check Work
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
                loading={actionLoading === 'complete'}
              >
                Complete Checkout
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {}
          {!checkWorkDone && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Numbers
                </label>
                {}
                <div className="min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {invoiceNumbers.map((invoice, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {invoice}
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoice(invoice)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={currentInput}
                      onChange={handleInvoiceInputChange}
                      onKeyDown={handleInvoiceInputKeyDown}
                      onBlur={handleInvoiceInputBlur}
                      placeholder={invoiceNumbers.length === 0 ? "Type invoice number and press Enter or comma..." : "Add another..."}
                      className="flex-1 min-w-[200px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter or comma to add multiple invoice numbers. Click × to remove. You can add as many invoices as needed.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Type
                </label>
                <Select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                >
                  <option value="closed">Closed Invoices</option>
                  <option value="pending">Pending Invoices</option>
                </Select>
              </div>
              <Alert variant="info" title="Next Steps">
                Click "Check Work" to fetch invoices and compare quantities with checked out items.
              </Alert>
            </>
          )}
          {}
          {checkWorkDone && comparisonData && (
            <>
              <Alert variant="success" title="Invoices Fetched">
                {comparisonData.summary.fetchedInvoices} of {comparisonData.summary.totalInvoices} invoices fetched successfully. Review the comparison below.
              </Alert>
              {}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Item Comparison</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Matched: {comparisonData.summary.matched} | Discrepancies: {comparisonData.summary.discrepancies}
                  </p>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Taken</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sold</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Difference</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisonData.comparison.discrepancies.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{item.quantityTaken}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{item.quantitySold}</td>
                          <td className={`px-4 py-3 text-sm text-center font-semibold ${
                            item.difference === 0 ? 'text-green-600 dark:text-green-400' :
                            item.difference > 0 ? 'text-blue-600 dark:text-blue-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={
                              item.status === 'matched' ? 'success' :
                              item.status === 'excess' ? 'info' : 'danger'
                            }>
                              {item.status === 'matched' ? 'Matched' :
                               item.status === 'excess' ? 'Excess (Returns)' : 'Shortage'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Alert variant="warning" title="Important">
                Review the comparison carefully. Click "Complete Checkout" to finalize. Stock movements will be recorded without double-decreasing inventory.
              </Alert>
            </>
          )}
        </div>
      </Modal>
      {}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !actionLoading && setShowCancelModal(false)}
        title="Cancel Checkout"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={actionLoading === 'cancel'}
            >
              Cancel Checkout
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert variant="warning" title="Warning">
            This will cancel the checkout. This action cannot be undone.
          </Alert>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Cancellation
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancelling this checkout"
              rows={3}
            />
          </div>
        </div>
      </Modal>
      {}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !actionLoading && setShowDeleteModal(false)}
        title="Delete Checkout"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={actionLoading === 'delete'}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={actionLoading === 'delete'}
            >
              Delete Checkout
            </Button>
          </>
        }
      >
        <Alert variant="danger" title="Warning">
          This will permanently delete this checkout. This action cannot be undone!
        </Alert>
      </Modal>
      {}
      <Modal
        isOpen={showAddInvoicesModal}
        onClose={() => {
          if (!actionLoading) {
            setShowAddInvoicesModal(false);
            setAdditionalInvoices([]);
            setAdditionalInput('');
            setAdditionalComparisonData(null);
            setAdditionalCheckWorkDone(false);
          }
        }}
        title={additionalCheckWorkDone ? "Review & Update Checkout" : "Add More Invoices"}
        size={additionalCheckWorkDone ? "xl" : "lg"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddInvoicesModal(false);
                setAdditionalInvoices([]);
                setAdditionalInput('');
                setAdditionalComparisonData(null);
                setAdditionalCheckWorkDone(false);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            {!additionalCheckWorkDone ? (
              <Button
                variant="secondary"
                onClick={handleCheckAdditionalWork}
                loading={actionLoading === 'check-additional-work'}
                disabled={additionalInvoices.length === 0}
              >
                Check Work
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleUpdateWithAdditionalInvoices}
                loading={actionLoading === 'update-invoices'}
              >
                Update Checkout
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          {}
          {!additionalCheckWorkDone && (
            <>
              <Alert variant="info" title="Current Invoices">
                This checkout already has {checkout.invoiceNumbers?.length || 0} invoice(s): {checkout.invoiceNumbers?.join(', ')}
              </Alert>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Invoice Numbers
                </label>
                {}
                <div className="min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {additionalInvoices.map((invoice, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {invoice}
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalInvoice(invoice)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={additionalInput}
                      onChange={handleAdditionalInvoiceInputChange}
                      onKeyDown={handleAdditionalInvoiceInputKeyDown}
                      onBlur={handleAdditionalInvoiceInputBlur}
                      placeholder={additionalInvoices.length === 0 ? "Type invoice number and press Enter or comma..." : "Add another..."}
                      className="flex-1 min-w-[200px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Press Enter or comma to add multiple invoice numbers. Click × to remove. You can add as many invoices as needed.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Type
                </label>
                <Select
                  value={additionalInvoiceType}
                  onChange={(e) => setAdditionalInvoiceType(e.target.value)}
                >
                  <option value="closed">Closed Invoices</option>
                  <option value="pending">Pending Invoices</option>
                </Select>
              </div>
              <Alert variant="info" title="Next Steps">
                Click "Check Work" to fetch the additional invoices and see the updated comparison.
              </Alert>
            </>
          )}
          {}
          {additionalCheckWorkDone && additionalComparisonData && (
            <>
              <Alert variant="success" title="Invoices Fetched">
                Total of {additionalComparisonData.summary.totalInvoices} invoices ({checkout.invoiceNumbers?.length || 0} existing + {additionalInvoices.length} new). Review the updated comparison below.
              </Alert>
              {}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Updated Item Comparison</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Matched: {additionalComparisonData.summary.matched} | Discrepancies: {additionalComparisonData.summary.discrepancies}
                  </p>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Taken</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sold</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Difference</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {additionalComparisonData.comparison.discrepancies.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{item.quantityTaken}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">{item.quantitySold}</td>
                          <td className={`px-4 py-3 text-sm text-center font-semibold ${
                            item.difference === 0 ? 'text-green-600 dark:text-green-400' :
                            item.difference > 0 ? 'text-blue-600 dark:text-blue-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={
                              item.status === 'matched' ? 'success' :
                              item.status === 'excess' ? 'info' : 'danger'
                            }>
                              {item.status === 'matched' ? 'Matched' :
                               item.status === 'excess' ? 'Excess (Returns)' : 'Shortage'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Alert variant="warning" title="Important">
                This will update the checkout with all invoices and recalculate the tally. Click "Update Checkout" to finalize.
              </Alert>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default TruckCheckoutDetail;
