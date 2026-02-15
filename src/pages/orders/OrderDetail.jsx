import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { getOrderByNumber } from '../../services/ordersService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const OrderDetail = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { showError } = useContext(ToastContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getOrderByNumber(orderNumber);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      showError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const statusMap = {
      'Complete': 'success',
      'Processing': 'warning',
      'Shipped': 'info',
      'Cancelled': 'danger',
      'Pending': 'secondary',
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Order Not Found
        </h2>
        <p className="text-slate-600 dark:text-gray-400 mb-6">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/orders')} variant="primary">
          Back to Orders
        </Button>
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
              onClick={() => navigate('/orders')}
              variant="secondary"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            View purchase order details from MyCustomerConnect
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(order.status)} size="lg">
            {order.status}
          </Badge>
          {order.stockProcessed && (
            <Badge variant="success" size="lg">
              Stock Processed
            </Badge>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Order Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Order Number</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white font-semibold">
                #{order.orderNumber}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Order Date</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                {formatDate(order.orderDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Amount</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Vendor Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Vendor Name</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white font-semibold">
                {order.vendor?.name || 'N/A'}
              </dd>
            </div>
            {order.vendor?.id && (
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Vendor ID</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {order.vendor.id}
                </dd>
              </div>
            )}
            {order.trackingNumber && (
              <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-gray-400">Tracking Number</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {order.trackingNumber}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Stock Processing Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
              Stock Processed
            </span>
            {order.stockProcessed ? (
              <Badge variant="success">Yes</Badge>
            ) : (
              <Badge variant="warning">No</Badge>
            )}
          </div>
          {order.stockProcessedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
                Processed At
              </span>
              <span className="text-sm text-slate-900 dark:text-white">
                {formatDate(order.stockProcessedAt)}
              </span>
            </div>
          )}
          {order.stockProcessingError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                Processing Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-500">
                {order.stockProcessingError}
              </p>
            </div>
          )}
        </div>
      </div>

      {}
      {order.items && order.items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Order Items ({order.items.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.sku || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {item.qty || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {formatCurrency(item.unitPrice || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.lineTotal || (item.qty || 0) * (item.unitPrice || 0))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-gray-700">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {}
      {order.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Notes
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
