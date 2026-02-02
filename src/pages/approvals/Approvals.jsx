import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign, Calendar } from 'lucide-react';

const Approvals = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingInvoices();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 lg:px-8 py-8 max-w-[1800px]">
        {}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                Pending Approvals
              </h1>
              <p className="text-slate-600 dark:text-gray-400 mt-2 ml-1">
                Review and approve pending sales invoices
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="warning" className="px-4 py-2 text-base">
                <Clock className="w-4 h-4 mr-2" />
                {pendingInvoices.length} Pending
              </Badge>
            </div>
          </div>
        </div>

        {}
        {pendingInvoices.length === 0 ? (
          <Card padding="lg" className="text-center py-20 shadow-sm border border-slate-200 dark:border-gray-700">
            <CheckCircle className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-slate-600 dark:text-gray-400">
              There are no pending invoices requiring approval at this time.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingInvoices.map((invoice) => (
              <Card
                key={invoice._id}
                padding="lg"
                className="shadow-sm border border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all bg-white dark:from-gray-800 dark:to-gray-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Invoice Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Invoice #{invoice.invoiceNumber}
                          </h3>
                          <Badge variant="warning" className="shadow-md">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Approval
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {invoice.customer?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${invoice.totalAmount?.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {invoice.items?.length || 0} items
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-blue-50 dark:bg-gray-750 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
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
                  <div className="flex lg:flex-col gap-3 lg:min-w-[180px]">
                    <Button
                      onClick={() => handleView(invoice._id)}
                      variant="outline"
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleApprove(invoice._id)}
                      disabled={processing}
                      className="flex-1 lg:flex-none"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(invoice._id)}
                      disabled={processing}
                      variant="outline"
                      className="flex-1 lg:flex-none border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
