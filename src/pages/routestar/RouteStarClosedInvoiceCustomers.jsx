import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarCustomerService from '../../services/routeStarCustomerService';
import goAuditsService from '../../services/goAuditsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { MagnifyingGlassIcon, CalendarIcon, UserGroupIcon, CurrencyDollarIcon, DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const RouteStarClosedInvoiceCustomers = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await routeStarCustomerService.getCustomersFromClosedInvoices(startDate, endDate);
      console.log('Closed invoice customers response:', response);
      setCustomers(response || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleSyncToGoAudits = async () => {
    // Prevent multiple clicks
    if (syncing) {
      showError('Sync already in progress. Please wait...');
      return;
    }

    if (customers.length === 0) {
      showError('No customers to sync. Please filter by date first.');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `You are about to sync ${filteredCustomers.length} customer(s) to GoAudits.\n\n` +
      `The system will:\n` +
      `• Check for existing locations in GoAudits\n` +
      `• Skip customers that already exist (no duplicates)\n` +
      `• Create new locations with all customer details\n\n` +
      `This may take several minutes. Do you want to continue?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSyncing(true);
      console.log(`Starting sync of ${filteredCustomers.length} customers to GoAudits...`);

      const result = await goAuditsService.syncClosedInvoiceCustomers(startDate, endDate);
      console.log('Sync result:', result);

      if (result.success) {
        const { created, mapped_existing, already_exists, errors, total } = result.data;

        // Build detailed success message
        let message = `✓ Sync completed successfully!\n\n`;
        message += `Total customers processed: ${total || filteredCustomers.length}\n`;
        if (created > 0) message += `✓ ${created} new location(s) created in GoAudits\n`;
        if (mapped_existing > 0) message += `✓ ${mapped_existing} mapped to existing location(s)\n`;
        if (already_exists > 0) message += `• ${already_exists} already synced (skipped)\n`;
        if (errors > 0) message += `⚠ ${errors} error(s) occurred\n`;

        showSuccess(message);
      } else {
        showError(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing to GoAudits:', error);

      // Better error message for sync lock
      if (error.message && error.message.includes('already in progress')) {
        showError('Another sync is currently running. Please wait for it to complete.');
      } else {
        showError('Failed to sync customers to GoAudits: ' + error.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      (customer.customerName || '').toLowerCase().includes(search) ||
      (customer.customerId || '').toLowerCase().includes(search) ||
      (customer.email || '').toLowerCase().includes(search) ||
      (customer.phone || '').toLowerCase().includes(search) ||
      (customer.accountNumber || '').toLowerCase().includes(search)
    );
  });

  const totalInvoices = filteredCustomers.reduce((sum, c) => sum + (c.invoiceCount || 0), 0);
  const totalAmount = filteredCustomers.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customers from Closed Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View customers who have closed invoices within a date range
          </p>
        </div>
        {customers.length > 0 && (
          <Button
            onClick={handleSyncToGoAudits}
            disabled={syncing}
            variant="primary"
            className={`flex items-center gap-2 ${syncing ? 'opacity-75 cursor-not-allowed animate-pulse' : ''}`}
          >
            <CloudArrowUpIcon className={`h-5 w-5 ${syncing ? 'animate-bounce' : ''}`} />
            {syncing ? `Syncing... Please wait` : `Sync ${filteredCustomers.length} to GoAudits`}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{filteredCustomers.length}</div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalInvoices}</div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DocumentTextIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Date Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                variant="primary"
                className="flex items-center gap-2 flex-1"
              >
                <CalendarIcon className="h-5 w-5" />
                Filter by Date
              </Button>
              <Button
                onClick={handleClearDates}
                variant="secondary"
                className="flex items-center gap-2"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Search Row */}
          {customers.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, email, phone, or account number..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Customers Table */}
      {customers.length === 0 && !loading ? (
        <Card>
          <div className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Select a date range to view customers from closed invoices
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoice Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customerId || customer.customerName} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.customerName}
                            </div>
                            {customer.customerId && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {customer.customerId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {customer.serviceAddress1 && <div>{customer.serviceAddress1}</div>}
                          {(customer.serviceCity || customer.serviceState || customer.serviceZip) && (
                            <div className="text-gray-500 dark:text-gray-400">
                              {[customer.serviceCity, customer.serviceState, customer.serviceZip].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white font-medium">
                            {customer.invoiceCount} invoice(s)
                          </div>
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            ${parseFloat(customer.totalAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {customer.customerId ? (
                          <Link
                            to={`/routestar/customers/${customer.customerId}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            View Details
                          </Link>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">No details</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RouteStarClosedInvoiceCustomers;
