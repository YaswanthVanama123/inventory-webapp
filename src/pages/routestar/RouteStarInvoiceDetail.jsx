import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { getInvoiceByNumber, syncInvoiceDetails } from '../../services/routestarService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RouteStarInvoiceDetail = () => {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceNumber]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await getInvoiceByNumber(invoiceNumber);
      if (response.success) {
        setInvoice(response.data);
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      showError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDetails = async () => {
    if (!isAdmin) {
      showError('Only administrators can sync invoice details');
      return;
    }

    setSyncing(true);
    try {
      const response = await syncInvoiceDetails(invoiceNumber);
      if (response.success) {
        showSuccess('Invoice details synced successfully');
        fetchInvoice();
      }
    } catch (err) {
      console.error('Error syncing invoice details:', err);
      showError(err.message || 'Failed to sync invoice details');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      'Completed': 'success',
      'Pending': 'warning',
      'Closed': 'info',
      'Cancelled': 'danger',
    };
    return statusMap[status] || 'secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleBack = () => {
    if (invoice?.invoiceType === 'closed') {
      navigate('/invoices/routestar/closed');
    } else {
      navigate('/invoices/routestar/pending');
    }
  };

  if (loading && !invoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Invoice Not Found
          </h2>
          <p className="text-slate-600 dark:text-gray-400 mb-6">
            Invoice #{invoiceNumber} could not be found.
          </p>
          <Button onClick={handleBack} variant="primary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              onClick={handleBack}
              variant="secondary"
              size="sm"
              className="!px-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <Badge variant={getStatusBadgeVariant(invoice.status)}>
              {invoice.status}
            </Badge>
            {invoice.stockProcessed && (
              <Badge variant="success">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Stock Processed
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {invoice.invoiceType === 'pending' ? 'Pending Invoice' : 'Closed Invoice'} from RouteStar
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              onClick={handleSyncDetails}
              disabled={syncing}
              variant="secondary"
              size="sm"
            >
              {syncing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Details
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  Customer Name
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {invoice.customer?.name || 'N/A'}
                </p>
              </div>
              {invoice.customer?.address && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                    Address
                  </label>
                  <p className="text-base text-slate-900 dark:text-white mt-1">
                    {invoice.customer.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {}
          {(invoice.assignedTo || invoice.signedBy || invoice.serviceNotes || invoice.invoiceMemo) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Additional Information
              </h2>
              <div className="space-y-3">
                {invoice.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                      Assigned To
                    </label>
                    <p className="text-base text-slate-900 dark:text-white mt-1">
                      {invoice.assignedTo}
                    </p>
                  </div>
                )}
                {invoice.signedBy && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                      Signed By
                    </label>
                    <p className="text-base text-slate-900 dark:text-white mt-1">
                      {invoice.signedBy}
                    </p>
                  </div>
                )}
                {invoice.serviceNotes && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                      Service Notes
                    </label>
                    <p className="text-base text-slate-900 dark:text-white mt-1">
                      {invoice.serviceNotes}
                    </p>
                  </div>
                )}
                {invoice.invoiceMemo && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                      Invoice Memo
                    </label>
                    <p className="text-base text-slate-900 dark:text-white mt-1">
                      {invoice.invoiceMemo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Invoice Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  Invoice Date
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1">
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                  Type
                </label>
                <p className="text-base text-slate-900 dark:text-white mt-1 capitalize">
                  {invoice.invoiceType}
                </p>
              </div>
              {invoice.salesTaxRate && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-gray-400">
                    Sales Tax Rate
                  </label>
                  <p className="text-base text-slate-900 dark:text-white mt-1">
                    {invoice.salesTaxRate}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Invoice Total
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-gray-400">Subtotal</span>
                <span className="text-base text-slate-900 dark:text-white font-medium">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-gray-400">Tax</span>
                <span className="text-base text-slate-900 dark:text-white font-medium">
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Line Items
            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-600 dark:text-gray-400">
                ({invoice.lineItems.length} items)
              </span>
            )}
          </h2>
        </div>

        {!invoice.lineItems || invoice.lineItems.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              No line items available
            </p>
            {isAdmin && (
              <Button onClick={handleSyncDetails} disabled={syncing} variant="primary" size="sm">
                {syncing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Details
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Tax Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {invoice.lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.quantity || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {formatCurrency(item.rate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.class || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.taxCode || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sync Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="text-slate-600 dark:text-gray-400">Synced At</label>
            <p className="text-slate-900 dark:text-white mt-1">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div>
            <label className="text-slate-600 dark:text-gray-400">Last Updated</label>
            <p className="text-slate-900 dark:text-white mt-1">
              {formatDate(invoice.updatedAt)}
            </p>
          </div>
          <div>
            <label className="text-slate-600 dark:text-gray-400">Stock Status</label>
            <p className="text-slate-900 dark:text-white mt-1">
              {invoice.stockProcessed ? (
                <Badge variant="success" size="sm">Processed</Badge>
              ) : (
                <Badge variant="warning" size="sm">Not Processed</Badge>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStarInvoiceDetail;
