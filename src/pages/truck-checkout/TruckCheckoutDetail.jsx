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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Complete modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [invoiceInput, setInvoiceInput] = useState('');
  const [invoiceType, setInvoiceType] = useState('closed');

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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

  const handleComplete = async () => {
    const invoiceNumbers = invoiceInput
      .split(/[\s,]+/)
      .map(num => num.trim())
      .filter(num => num);

    if (invoiceNumbers.length === 0) {
      showError('Please enter at least one invoice number');
      return;
    }

    try {
      setActionLoading('complete');
      await truckCheckoutService.completeCheckout(id, invoiceNumbers, invoiceType);
      showSuccess('Checkout completed successfully');
      setShowCompleteModal(false);
      setInvoiceInput('');
      loadCheckout();
    } catch (error) {
      const errorData = error.response?.data;

      // Special handling for duplicate invoice error
      if (errorData?.duplicateCheckouts && errorData.duplicateCheckouts.length > 0) {
        const duplicates = errorData.duplicateCheckouts;
        const duplicateDetails = duplicates.map(dup =>
          `${dup.employeeName} (Checkout #${dup.checkoutId}): ${dup.invoices.join(', ')}`
        ).join('\n');

        showError(
          `${errorData.message}\n\nDuplicate invoices found in:\n${duplicateDetails}`,
          10000 // Show for 10 seconds
        );
      } else {
        showError(errorData?.message || 'Failed to complete checkout');
      }
    } finally {
      setActionLoading(null);
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

  const getStatusBadge = (status) => {
    const config = {
      checked_out: { variant: 'warning', label: 'Checked Out', icon: ClockIcon },
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/truck-checkouts')}
            className="mb-3"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checkouts
          </Button>
          <div className="flex items-center gap-4">
            <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Checkout Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {checkout.employeeName} - {formatDate(checkout.checkoutDate)}
              </p>
            </div>
          </div>
        </div>
        {getStatusBadge(checkout.status)}
      </div>

      {/* Action Buttons */}
      {checkout.status === 'checked_out' && (
        <Card>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              onClick={() => setShowCompleteModal(true)}
              loading={actionLoading === 'complete'}
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Complete with Invoices
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowCancelModal(true)}
              loading={actionLoading === 'cancel'}
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Cancel Checkout
            </Button>
          </div>
        </Card>
      )}

      {checkout.status === 'completed' && (
        <Card>
          <div className="flex items-center gap-3 flex-wrap">
            {canTally && (
              <Button
                variant="primary"
                onClick={handleTally}
                loading={actionLoading === 'tally'}
              >
                <CalculatorIcon className="w-5 h-5 mr-2" />
                {hasTally ? 'Re-Tally' : 'Fetch & Tally Invoices'}
              </Button>
            )}
            {canProcessStock && (
              <Button
                variant="success"
                onClick={handleProcessStock}
                loading={actionLoading === 'stock'}
              >
                <CubeIcon className="w-5 h-5 mr-2" />
                Process Stock Movements
              </Button>
            )}
            {checkout.stockProcessed && (
              <Badge variant="success" size="lg">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Stock Processed
              </Badge>
            )}
          </div>
          {canProcessStock && (
            <Alert variant="info" title="Stock Processing" className="mt-4">
              This will adjust stock levels by adding back sold items (to compensate for double-decrease during checkout and invoice sync) and tracking used items separately.
            </Alert>
          )}
        </Card>
      )}

      {/* Employee Information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Employee Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Employee Name</p>
            <p className="font-semibold text-gray-900 dark:text-white">{checkout.employeeName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
            <p className="font-semibold text-gray-900 dark:text-white">{checkout.employeeId || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Truck Number</p>
            <p className="font-semibold text-gray-900 dark:text-white">{checkout.truckNumber || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Checkout Date</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(checkout.checkoutDate)}</p>
          </div>
          {checkout.completedDate && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{formatDate(checkout.completedDate)}</p>
            </div>
          )}
        </div>
        {checkout.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
            <p className="text-gray-900 dark:text-white mt-1">{checkout.notes}</p>
          </div>
        )}
      </Card>

      {/* Items Taken */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Items Taken ({checkout.itemsTaken?.length || 0})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {checkout.itemsTaken?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {item.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td colSpan="2" className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-6 py-3 text-sm font-bold text-right text-gray-900 dark:text-white">
                  {checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Invoice Information */}
      {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Invoice Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Invoice Numbers</p>
              <div className="flex flex-wrap gap-2">
                {checkout.invoiceNumbers.map((invNum, index) => (
                  <Badge key={index} variant="info">
                    {invNum}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Type</p>
              <Badge variant={checkout.invoiceType === 'closed' ? 'success' : 'warning'}>
                {checkout.invoiceType}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Tally Results */}
      {hasTally && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalculatorIcon className="w-6 h-6" />
            Tally Results
          </h2>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Items Taken</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {checkout.tallyResults.itemsTaken?.reduce((sum, item) => sum + item.quantityTaken, 0) || 0}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400">Items Sold</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {checkout.tallyResults.itemsSold?.reduce((sum, item) => sum + item.quantitySold, 0) || 0}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">From invoices</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-orange-600 dark:text-orange-400">Items Used</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {(checkout.tallyResults.itemsTaken?.reduce((sum, item) => sum + item.quantityTaken, 0) || 0) -
                 (checkout.tallyResults.itemsSold?.reduce((sum, item) => sum + item.quantitySold, 0) || 0)}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">For service/installation</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-purple-600 dark:text-purple-400">Discrepancies</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {checkout.tallyResults.discrepancies?.filter(d => d.status !== 'matched').length || 0}
              </p>
            </div>
          </div>

          {/* Discrepancies Table */}
          {checkout.tallyResults.discrepancies && checkout.tallyResults.discrepancies.length > 0 && (
            <>
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Item Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Taken
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Sold
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {checkout.tallyResults.discrepancies.map((item, index) => (
                      <tr key={index} className={item.status !== 'matched' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                          {item.sku && <span className="text-xs text-gray-500 ml-2">({item.sku})</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                          {item.quantityTaken}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                          {item.quantitySold}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                          item.difference === 0 ? 'text-gray-600 dark:text-gray-400' :
                          item.difference > 0 ? 'text-orange-600 dark:text-orange-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {item.difference > 0 ? item.difference : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.status === 'matched' && <Badge variant="success">Matched</Badge>}
                          {item.status === 'excess' && (
                            <Badge variant="warning">
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              Has Returns
                            </Badge>
                          )}
                          {item.status === 'shortage' && (
                            <Badge variant="danger">
                              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                              Shortage
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => !actionLoading && setShowCompleteModal(false)}
        title="Complete Checkout"
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowCompleteModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              loading={actionLoading === 'complete'}
            >
              Complete Checkout
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invoice Numbers
            </label>
            <Textarea
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
              placeholder="Enter invoice numbers (one per line or comma-separated)&#10;Example: INV-001, INV-002, INV-003"
              rows={5}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter multiple invoice numbers separated by commas or new lines
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
            After completing, you can fetch the invoices from RouteStar and tally them against the items taken.
          </Alert>
        </div>
      </Modal>

      {/* Cancel Modal */}
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
    </div>
  );
};

export default TruckCheckoutDetail;
