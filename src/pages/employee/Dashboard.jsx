import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import employeeDataService from '../../services/employeeDataService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noTruck, setNoTruck] = useState(false);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgInvoiceValue: 0,
    completedInvoices: 0,
    pendingInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    setNoTruck(false);
    try {
      const response = await employeeDataService.getMyCombinedDashboard();
      const data = response?.data || response || {};
      setStats((prev) => ({ ...prev, ...(data.statistics || {}) }));
      setRecentInvoices(data.recentActivity || []);
      setTopItems(data.performance?.topItems || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to load your dashboard';
      // A missing truck assignment isn't a hard error — show a friendly note.
      if (/truck/i.test(message)) {
        setNoTruck(true);
      } else {
        setError(message);
        showToast('error', 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    `$${Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('complete') || s.includes('closed') || s.includes('paid'))
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (s.includes('pending') || s.includes('open'))
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'My Invoices',
      value: stats.totalInvoices,
      sub: `${stats.completedInvoices} completed · ${stats.pendingInvoices} pending`,
      gradient: 'from-blue-500 to-blue-600',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      label: 'Items Sold',
      value: Number(stats.totalItems || 0).toLocaleString(),
      sub: 'Total quantity in period',
      gradient: 'from-indigo-500 to-indigo-600',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      sub: `Avg ${formatCurrency(stats.avgInvoiceValue)} / invoice`,
      gradient: 'from-emerald-500 to-emerald-600',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here's your work overview for the last 30 days
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {noTruck && (
          <div className="mb-6">
            <Alert
              type="info"
              message="No truck is assigned to your account yet. Your work stats will appear here once an administrator assigns you a truck."
            />
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((c) => (
            <Card key={c.label} padding="normal">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {c.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {c.value}
                  </p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${c.gradient} rounded-lg shadow-lg`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">{c.sub}</p>
            </Card>
          ))}
        </div>

        {/* Recent invoices + top items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card padding="normal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Invoices
              </h2>
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                No recent invoices.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentInvoices.slice(0, 6).map((inv, i) => (
                  <li key={inv.invoiceNumber || i} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        #{inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(inv.invoiceDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(inv.status)}`}>
                        {inv.status || 'Unknown'}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(inv.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="normal">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Items
            </h2>
            {topItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                No items sold yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {topItems.slice(0, 6).map((item, i) => (
                  <li key={item.itemName || i} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.itemName || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Number(item.totalQuantity || 0).toLocaleString()} sold
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
