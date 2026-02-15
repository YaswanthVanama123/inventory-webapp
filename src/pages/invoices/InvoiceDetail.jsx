import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data.invoice);
    } catch (err) {
      setError(err.message || 'Failed to load invoice');
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { variant: 'default', label: 'Draft' },
      pending: { variant: 'warning', label: 'Pending' },
      sent: { variant: 'info', label: 'Sent' },
      paid: { variant: 'success', label: 'Paid' },
      overdue: { variant: 'danger', label: 'Overdue' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
    };
    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      unpaid: { variant: 'warning', label: 'Unpaid' },
      partial: { variant: 'info', label: 'Partially Paid' },
      paid: { variant: 'success', label: 'Paid' },
      refunded: { variant: 'default', label: 'Refunded' },
    };
    const config = statusConfig[paymentStatus?.toLowerCase()] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadPDF = async () => {
    setActionLoading('download');
    try {
      
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendEmail = async () => {
    setActionLoading('email');
    try {
      await api.post(`/invoices/${id}/send`);
      alert('Invoice sent successfully');
      fetchInvoice();
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!confirm('Mark this invoice as paid?')) return;
    setActionLoading('paid');
    try {
      await api.patch(`/invoices/${id}/status`, {
        paymentStatus: 'paid',
      });
      alert('Invoice marked as paid');
      fetchInvoice();
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Failed to update invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    setActionLoading('cancel');
    try {
      await api.patch(`/invoices/${id}/status`, {
        status: 'cancelled',
      });
      alert('Invoice cancelled');
      fetchInvoice();
    } catch (err) {
      console.error('Error cancelling invoice:', err);
      alert('Failed to cancel invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading invoice..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Alert variant="warning" title="Invoice Not Found">
          The requested invoice could not be found.
        </Alert>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/invoices')}
              className="text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Back to Invoices</span>
              <span className="xs:hidden">Back</span>
            </Button>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                loading={actionLoading === 'download'}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                loading={actionLoading === 'email'}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Send Email</span>
              </Button>

              {invoice.status?.toLowerCase() === 'draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/invoices/${id}/edit`)}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              {invoice.paymentStatus?.toLowerCase() !== 'paid' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkAsPaid}
                  loading={actionLoading === 'paid'}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Mark as Paid</span>
                </Button>
              )}

              {invoice.status?.toLowerCase() !== 'cancelled' && invoice.status?.toLowerCase() !== 'paid' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancel}
                  loading={actionLoading === 'cancel'}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg print:shadow-none print:rounded-none">
          {}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  INVOICE
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  #{invoice.invoiceNumber}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(invoice.status)}
                {getPaymentStatusBadge(invoice.paymentStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  From
                </h3>
                <div className="text-gray-900 dark:text-white">
                  <p className="font-semibold text-sm sm:text-base">{invoice.from?.companyName || 'Your Company'}</p>
                  {invoice.from?.address && <p className="text-xs mt-1">{invoice.from.address}</p>}
                  {invoice.from?.email && <p className="text-xs">{invoice.from.email}</p>}
                  {invoice.from?.phone && <p className="text-xs">{invoice.from.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Invoice Details
                </h3>
                <div className="text-gray-900 dark:text-white space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                    <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                  </div>
                  {invoice.paymentTerms && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Payment Terms:</span>
                      <span className="font-medium">{invoice.paymentTerms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3 sm:p-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Bill To
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4">
              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                {invoice.customer?.name || invoice.customerName}
              </p>
              {invoice.customer?.email && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {invoice.customer.email}
                </p>
              )}
              {invoice.customer?.phone && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {invoice.customer.phone}
                </p>
              )}
              {invoice.customer?.address && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {invoice.customer.address}
                </p>
              )}
            </div>
          </div>

          {}
          <div className="p-3 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Invoice Items
            </h3>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 sm:py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Item
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                      SKU
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Qty
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                      Unit Price
                    </th>
                    <th className="text-right py-2 sm:py-3 px-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <td className="py-3 sm:py-4 px-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {item.name || item.itemName}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                          SKU: {item.skuCode || item.sku || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {formatCurrency(item.priceAtSale || item.unitPrice || item.price)} each
                        </p>
                      </td>
                      <td className="py-3 sm:py-4 px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                        {item.skuCode || item.sku || 'N/A'}
                      </td>
                      <td className="py-3 sm:py-4 px-2 text-xs sm:text-sm text-right text-gray-900 dark:text-white">
                        {item.quantity} {item.unit || ''}
                      </td>
                      <td className="py-3 sm:py-4 px-2 text-xs sm:text-sm text-right text-gray-900 dark:text-white hidden sm:table-cell">
                        {formatCurrency(item.priceAtSale || item.unitPrice || item.price)}
                      </td>
                      <td className="py-3 sm:py-4 px-2 text-xs sm:text-sm text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.subtotal || (item.priceAtSale || item.unitPrice || item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-6">
            <div className="flex justify-end">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotalAmount || invoice.subtotal)}</span>
                </div>

                {(invoice.discount?.amount || invoice.discount) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <span>Discount:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -{formatCurrency(invoice.discount?.amount || invoice.discount)}
                    </span>
                  </div>
                )}

                {(invoice.taxAmount || invoice.tax) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <span>Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}:</span>
                    <span className="font-medium">{formatCurrency(invoice.taxAmount || invoice.tax)}</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(invoice.totalAmount || invoice.total)}
                    </span>
                  </div>
                </div>

                {invoice.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span>Amount Paid:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(invoice.amountPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Balance Due:
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {formatCurrency((invoice.totalAmount || invoice.total) - invoice.amountPaid)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {}
          {invoice.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {}
          {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-6 print:hidden">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Payment History
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {invoice.paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          Payment Received
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(payment.date)} - {payment.method || 'Not specified'}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {invoice.qrCode && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Scan to pay
                </p>
                <img
                  src={invoice.qrCode}
                  alt="Payment QR Code"
                  className="w-32 h-32 mx-auto"
                />
              </div>
            </div>
          )}

          {}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {invoice.footer || (
                <>
                  <p>Thank you for your business!</p>
                  <p className="mt-2">
                    If you have any questions about this invoice, please contact us.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetail;
