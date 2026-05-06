import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import orderDiscrepancyService from '../../services/orderDiscrepancyService';
import purchaseOrderService from '../../services/purchaseOrderService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const OrderVerification = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [hasDiscrepancies, setHasDiscrepancies] = useState(false);
  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  useEffect(() => {
    const discrepancies = items.some(item => {
      const receivingNow = parseFloat(item.receivingNow || 0);
      const previouslyReceived = item.receivedQuantity || 0;
      const expected = item.qty;
      const totalAfterThis = previouslyReceived + receivingNow;
      return totalAfterThis !== expected;
    });
    setHasDiscrepancies(discrepancies);
  }, [items]);
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
        setItems(response.data.items.map(item => ({
          ...item,
          receivingNow: Math.max(0, (item.qty || 0) - (item.receivedQuantity || 0)),
          itemName: item.name
        })));
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      showError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    newItems[index].receivingNow = value;
    setItems(newItems);
  };
  const handleAllGood = async () => {
    try {
      setSubmitting(true);
      const response = await orderDiscrepancyService.verifyOrder(orderId, {
        allGood: true,
        notes: notes.trim() || 'All items received as expected'
      });
      if (response.success) {
        showSuccess('Order verified successfully - all items correct');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Verify order error:', error);
      showError(error.response?.data?.message || 'Failed to verify order');
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmitWithDiscrepancies = async () => {
    try {
      setSubmitting(true);
      const itemsData = items.map(item => ({
        sku: item.sku,
        itemName: item.itemName || item.name,
        expectedQuantity: item.qty,
        receivedQuantity: parseFloat(item.receivingNow) || 0,
        notes: item.notes || ''
      }));
      const response = await orderDiscrepancyService.verifyOrder(orderId, {
        allGood: false,
        items: itemsData,
        notes: notes.trim()
      });
      if (response.success) {
        const { partiallyVerifiedItems = [], fullyReceived = false } = response.data;

        if (fullyReceived) {
          showSuccess('Order fully received and verified!');
          navigate('/orders');
        } else {
          showSuccess(`Partial receipt recorded - ${partiallyVerifiedItems.length} item(s) still pending`);
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Submit discrepancies error:', error);
      showError(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!order) {
    return (
      <div className="p-6">
        <Alert variant="danger" title="Error">
          Order not found
        </Alert>
      </div>
    );
  }
  if (order.status === 'received' || order.status === 'completed') {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="info" title="Already Verified">
          This order has already been verified.
        </Alert>
        <Button onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-5">
      {}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Order Receipt
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Check received items and record any discrepancies
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
      {}
      <Card variant="elevated" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Vendor</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.vendor?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Order Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
      {}
      <Alert variant="info" title="Instructions">
        <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
          <li>Enter the actual quantity received for each item</li>
          <li>If all items match exactly, click "All Good"</li>
          <li>If there are differences, they will be recorded as discrepancies for admin approval</li>
        </ul>
      </Alert>
      {}
      <Card variant="elevated" padding="none">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Items ({items.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ordered Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Previously Received
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Receiving Now *
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Remaining After
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, index) => {
                const receivingNow = parseFloat(item.receivingNow) || 0;
                const previouslyReceived = item.receivedQuantity || 0;
                const expected = item.qty;
                const totalAfterThis = previouslyReceived + receivingNow;
                const remaining = Math.max(0, expected - totalAfterThis);
                const isFullyReceived = totalAfterThis >= expected;
                const hasDiscrepancy = totalAfterThis !== expected;
                return (
                  <tr key={index} className={hasDiscrepancy && !isFullyReceived ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.sku}
                      </div>
                      {item.verificationHistory && item.verificationHistory.length > 0 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {item.verificationHistory.length} previous receipt(s)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {expected}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                      {previouslyReceived > 0 ? (
                        <span className="font-medium text-blue-600 dark:text-blue-400">{previouslyReceived}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Input
                        type="number"
                        value={item.receivingNow}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        min="0"
                        max={remaining}
                        step="1"
                        className="w-24 text-right"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-bold ${
                        remaining === 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {remaining}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isFullyReceived ? (
                        <Badge variant="success">Complete</Badge>
                      ) : previouslyReceived > 0 ? (
                        <Badge variant="warning">Partial</Badge>
                      ) : (
                        <Badge variant="info">Pending</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {}
      <Card variant="elevated" padding="lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          rows="3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this order verification..."
        />
      </Card>
      {}
      {hasDiscrepancies && (
        <Alert variant="warning" title="Discrepancies Detected">
          <p className="mt-2">
            Some items have quantity differences. These will be recorded as discrepancies and sent to admin for approval.
          </p>
        </Alert>
      )}
      {}
      <div className="flex justify-end gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          disabled={submitting}
        >
          Cancel
        </Button>
        {!hasDiscrepancies && (
          <Button
            variant="success"
            onClick={handleAllGood}
            loading={submitting}
            disabled={submitting}
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            All Good - Everything Matches
          </Button>
        )}
        {hasDiscrepancies && (
          <Button
            variant="primary"
            onClick={handleSubmitWithDiscrepancies}
            loading={submitting}
            disabled={submitting}
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
            Submit with Discrepancies
          </Button>
        )}
      </div>
    </div>
  );
};
export default OrderVerification;
