import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TruckIcon,
  CalendarIcon,
  DollarSignIcon,
  FileTextIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import employeeDataService from '../../services/employeeDataService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const EmployeeWorkDashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const { showError, showSuccess } = useContext(ToastContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [truckNumberInput, setTruckNumberInput] = useState('');
  const [savingTruckNumber, setSavingTruckNumber] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.truckNumber) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.truckNumber, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData, performanceData] = await Promise.all([
        employeeDataService.getMyStatistics(dateRange.start, dateRange.end),
        employeeDataService.getMyRecentActivity(10),
        employeeDataService.getMyPerformance(dateRange.start, dateRange.end)
      ]);

      setStatistics(statsData.data);
      setRecentActivity(activityData.data);
      setPerformance(performanceData.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTruckNumber = async () => {
    if (!truckNumberInput.trim()) {
      showError('Please enter a truck number');
      return;
    }

    setSavingTruckNumber(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/users/me/truck-number', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          truckNumber: truckNumberInput.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to update truck number');
      }

      // Update user in context and localStorage
      const updatedUser = { ...user, truckNumber: truckNumberInput.toUpperCase() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showSuccess('Truck number assigned successfully!');
      setTruckNumberInput('');
    } catch (error) {
      console.error('Error saving truck number:', error);
      showError(error.message || 'Failed to save truck number');
    } finally {
      setSavingTruckNumber(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status) => {
    const variants = {
      'Completed': 'success',
      'Pending': 'warning',
      'Closed': 'secondary',
      'Cancelled': 'danger'
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user?.truckNumber) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12 max-w-md mx-auto">
            <TruckIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Assign Your Truck Number
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please enter your truck number to access your work dashboard.
            </p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-2">
                Truck Number
              </label>
              <input
                type="text"
                value={truckNumberInput}
                onChange={(e) => setTruckNumberInput(e.target.value.toUpperCase())}
                placeholder="e.g., NRV01, TRUCK01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-left">
                Enter the unique truck/vehicle identifier assigned to you
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleSaveTruckNumber}
                disabled={savingTruckNumber || !truckNumberInput.trim()}
                loading={savingTruckNumber}
                fullWidth
              >
                {savingTruckNumber ? 'Assigning...' : 'Assign Truck Number'}
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you're unsure about your truck number, please contact your administrator.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            My Work Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Truck #{user.truckNumber} • {user.fullName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Invoices */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Invoices
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalInvoices}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {statistics.completedInvoices} Completed
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    {statistics.pendingInvoices} Pending
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Avg: {formatCurrency(statistics.avgInvoiceValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </Card>

          {/* Total Items Serviced */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Items Serviced
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalItems}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Total quantity
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </Card>

          {/* Completion Rate */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalInvoices > 0
                    ? Math.round((statistics.completedInvoices / statistics.totalInvoices) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {statistics.completedInvoices}/{statistics.totalInvoices} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Performance and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        {performance?.topItems && performance.topItems.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-blue-600" />
              Top Services
            </h2>
            <div className="space-y-3">
              {performance.topItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.count} times • Qty: {item.totalQuantity}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(item.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/invoices/routestar/pending')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.invoiceNumber}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/routestar/${invoice.invoiceNumber}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      #{invoice.invoiceNumber}
                    </span>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {invoice.customer?.name || 'Unknown Customer'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(invoice.invoiceDate)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  {invoice.lineItems && invoice.lineItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {invoice.lineItems.length} item(s): {invoice.lineItems.map(item => item.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      {performance?.dailyRevenue && performance.dailyRevenue.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Daily Revenue Trend
          </h2>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-2 min-w-max pb-4" style={{ height: '200px' }}>
              {performance.dailyRevenue.map((day, index) => {
                const maxRevenue = Math.max(...performance.dailyRevenue.map(d => d.revenue));
                const height = (day.revenue / maxRevenue) * 100;

                return (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                      {formatCurrency(day.revenue)}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${formatDate(day.date)}: ${formatCurrency(day.revenue)}`}
                    />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {day.invoiceCount} inv
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmployeeWorkDashboard;
