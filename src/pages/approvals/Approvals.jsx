import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign, Calendar, Package, Trash2 } from 'lucide-react';

const Approvals = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState('invoices');
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [pendingPurchaseDeletions, setPendingPurchaseDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingInvoices();
    fetchPendingPurchaseDeletions();
  }, []);

  const fetchPendingInvoices = async () => {
    setLoading(true);
    try {

      const response = await api.get('/invoices?status=pending');
      setPendingInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching pending invoices:', error);
      showError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPurchaseDeletions = async () => {
    try {
      const response = await api.get('/approvals/purchases/pending');
      setPendingPurchaseDeletions(response.data.purchases || []);
    } catch (error) {
      console.error('Error fetching pending purchase deletions:', error);
      showError('Failed to load pending purchase deletions');
    }
  };

  const handleApprove = async (invoiceId) => {
    setProcessing(true);
    try {
      await api.patch(`/invoices/${invoiceId}`, {
        status: 'approved',
        paymentStatus: 'paid'
      });
      showSuccess('Invoice approved successfully');
      fetchPendingInvoices(); 
    } catch (error) {
      console.error('Error approving invoice:', error);
      showError('Failed to approve invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (invoiceId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setProcessing(true);
    try {
      await api.patch(`/invoices/${invoiceId}`, {
        status: 'rejected',
        rejectionReason: reason
      });
      showSuccess('Invoice rejected');
      fetchPendingInvoices(); 
    } catch (error) {
      console.error('Error rejecting invoice:', error);
      showError('Failed to reject invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleView = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleApprovePurchaseDeletion = async (purchaseId) => {
    setProcessing(true);
    try {
      await api.post(`/approvals/purchases/${purchaseId}/approve`);
      showSuccess('Purchase deletion approved successfully');
      fetchPendingPurchaseDeletions();
    } catch (error) {
      console.error('Error approving purchase deletion:', error);
      showError(error.response?.data?.message || 'Failed to approve purchase deletion');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectPurchaseDeletion = async (purchaseId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setProcessing(true);
    try {
      await api.post(`/approvals/purchases/${purchaseId}/reject`, { reason });
      showSuccess('Purchase deletion rejected');
      fetchPendingPurchaseDeletions();
    } catch (error) {
      console.error('Error rejecting purchase deletion:', error);
      showError(error.response?.data?.message || 'Failed to reject purchase deletion');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-[1800px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                Pending Approvals
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1 sm:mt-2 ml-0 sm:ml-1">
                Review and approve pending items
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge variant="warning" className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm lg:text-base">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {activeTab === 'invoices' ? pendingInvoices.length : pendingPurchaseDeletions.length} Pending
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-slate-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`
                  py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Invoice Approvals</span>
                  <span className="xs:hidden">Invoices</span>
                  {pendingInvoices.length > 0 && (
                    <Badge variant="warning" className="ml-1 text-xs">
                      {pendingInvoices.length}
                    </Badge>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('purchase-deletions')}
                className={`
                  py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
                  ${activeTab === 'purchase-deletions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Purchase Deletions</span>
                  <span className="xs:hidden">Deletions</span>
                  {pendingPurchaseDeletions.length > 0 && (
                    <Badge variant="warning" className="ml-1 text-xs">
                      {pendingPurchaseDeletions.length}
                    </Badge>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Invoice Approvals Tab */}
        {activeTab === 'invoices' && (
          <>
            {pendingInvoices.length === 0 ? (
              <Card padding="lg" className="text-center py-12 sm:py-20 shadow-sm border border-slate-200 dark:border-gray-700">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  All caught up!
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400">
                  There are no pending invoices requiring approval at this time.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {pendingInvoices.map((invoice) => (
                  <Card
                    key={invoice._id}
                    padding="lg"
                    className="shadow-sm border border-slate-200 dark:border-gray-700 transition-all bg-white dark:from-gray-800 dark:to-gray-700"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                      {/* Invoice Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                Invoice #{invoice.invoiceNumber}
                              </h3>
                              <Badge variant="warning" className="shadow-md text-xs sm:text-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="hidden xs:inline">Pending Approval</span>
                                <span className="xs:hidden">Pending</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">{invoice.customer?.name || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                              ${invoice.totalAmount?.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {invoice.items?.length || 0} items
                            </div>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-blue-50 dark:bg-gray-750 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="min-w-0">
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white truncate block sm:inline">
                                {invoice.customer?.email || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {invoice.customer?.phone || 'N/A'}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                                {invoice.paymentMethod?.replace('_', ' ') || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:min-w-[180px]">
                        <Button
                          onClick={() => handleView(invoice._id)}
                          variant="outline"
                          className="flex-1 lg:flex-none text-xs sm:text-sm"
                          size="sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleApprove(invoice._id)}
                          disabled={processing}
                          className="flex-1 lg:flex-none text-xs sm:text-sm"
                          size="sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(invoice._id)}
                          disabled={processing}
                          variant="outline"
                          className="flex-1 lg:flex-none border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Purchase Deletions Tab */}
        {activeTab === 'purchase-deletions' && (
          <>
            {pendingPurchaseDeletions.length === 0 ? (
              <Card padding="lg" className="text-center py-12 sm:py-20 shadow-sm border border-slate-200 dark:border-gray-700">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  All caught up!
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400">
                  There are no pending purchase deletions requiring approval at this time.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {pendingPurchaseDeletions.map((purchase) => (
                  <Card
                    key={purchase._id}
                    padding="lg"
                    className="shadow-sm border border-slate-200 dark:border-gray-700 transition-all bg-white dark:from-gray-800 dark:to-gray-700"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                      {/* Purchase Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                                <span className="break-words">{purchase.inventoryItem?.name || 'Unknown Item'}</span>
                              </h3>
                              <Badge variant="danger" className="shadow-md text-xs sm:text-sm flex-shrink-0">
                                <Trash2 className="w-3 h-3 mr-1" />
                                <span className="hidden xs:inline">Deletion Request</span>
                                <span className="xs:hidden">Delete</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">Purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">Requested by: {purchase.deletionRequestedBy?.username || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                              ${purchase.totalCost?.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Qty: {purchase.quantity}
                            </div>
                          </div>
                        </div>

                        {/* Purchase Details */}
                        <div className="bg-orange-50 dark:bg-gray-750 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {purchase.supplier?.name || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Unit Cost:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                ${purchase.unitCost?.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {purchase.quantity}
                              </span>
                            </div>
                            <div className="md:col-span-2 min-w-0">
                              <span className="text-gray-600 dark:text-gray-400">Requested At:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white truncate block sm:inline">
                                {new Date(purchase.deletionRequestedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:min-w-[180px]">
                        <Button
                          onClick={() => handleApprovePurchaseDeletion(purchase._id)}
                          disabled={processing}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                          size="sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Approve Deletion</span>
                          <span className="xs:hidden">Approve</span>
                        </Button>
                        <Button
                          onClick={() => handleRejectPurchaseDeletion(purchase._id)}
                          disabled={processing}
                          variant="outline"
                          className="flex-1 lg:flex-none border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 text-xs sm:text-sm"
                          size="sm"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Approvals;
