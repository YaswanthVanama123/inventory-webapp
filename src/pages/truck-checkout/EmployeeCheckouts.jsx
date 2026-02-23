import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UserIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EmployeeCheckouts = () => {
  const { employeeName } = useParams();
  const navigate = useNavigate();
  const { showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [checkouts, setCheckouts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, [employeeName]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [checkoutsResponse, statsResponse] = await Promise.all([
        truckCheckoutService.getEmployeeCheckouts(employeeName, 100),
        truckCheckoutService.getEmployeeStats(employeeName)
      ]);

      setCheckouts(checkoutsResponse.data || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Load employee data error:', error);
      showError('Failed to load employee data');
    } finally {
      setLoading(false);
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
      <Badge variant={variant}>
        <Icon className="w-4 h-4 mr-1" />
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
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
          Back to All Checkouts
        </Button>
        <div className="flex items-center gap-4">
          <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {employeeName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Checkout History & Statistics
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Checkouts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Checkouts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCheckouts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.completedCheckouts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats.activeCheckouts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
          </div>

          {/* Total Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{stats.totalInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkouts List */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Checkout History ({checkouts.length} records)
        </h2>

        {checkouts.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No checkouts found for this employee</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkouts.map((checkout) => (
              <div
                key={checkout._id}
                onClick={() => navigate(`/truck-checkouts/${checkout._id}`)}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(checkout.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(checkout.checkoutDate)}
                    </span>
                  </div>
                  {checkout.truckNumber && (
                    <Badge variant="secondary">
                      <TruckIcon className="w-4 h-4 mr-1" />
                      {checkout.truckNumber}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Items Taken</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {checkout.itemsTaken?.length || 0} items
                      <span className="text-sm text-gray-500 ml-2">
                        ({checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0} total qty)
                      </span>
                    </p>
                  </div>

                  {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoices</p>
                      <div className="flex flex-wrap gap-1">
                        {checkout.invoiceNumbers.slice(0, 3).map((invNum, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {invNum}
                          </Badge>
                        ))}
                        {checkout.invoiceNumbers.length > 3 && (
                          <Badge variant="secondary" size="sm">
                            +{checkout.invoiceNumbers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {checkout.stockProcessed && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock Status</p>
                      <Badge variant="success">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Processed
                      </Badge>
                    </div>
                  )}
                </div>

                {checkout.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Notes:</span> {checkout.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeCheckouts;
