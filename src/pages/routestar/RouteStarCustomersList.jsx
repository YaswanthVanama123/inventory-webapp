import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarCustomerService from '../../services/routeStarCustomerService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, UserGroupIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const RouteStarCustomersList = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingDetails, setSyncingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 });
  const [pagination, setPagination] = useState({ totalCount: 0, currentPage: 1, limit: 50, totalPages: 0 });
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSalesRep, setSelectedSalesRep] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, searchText ? 500 : 0);
    return () => clearTimeout(timer);
  }, [pagination.currentPage, selectedType, selectedSalesRep, selectedStatus, filterActive, searchText]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchText || undefined,
        customerType: selectedType !== 'all' ? selectedType : undefined,
        salesRep: selectedSalesRep !== 'all' ? selectedSalesRep : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        active: filterActive !== 'all' ? filterActive : undefined
      };

      const [customersResponse, statsResponse] = await Promise.all([
        routeStarCustomerService.getCustomers(params),
        routeStarCustomerService.getCustomerStats()
      ]);

      console.log('Customers response:', customersResponse);
      console.log('Stats response:', statsResponse);

      // The axios interceptor already extracts response.data, so we get the data directly
      setCustomers(customersResponse?.customers || []);
      setPagination(customersResponse?.pagination || { totalCount: 0, currentPage: 1, limit: 50, totalPages: 0 });
      setStats(statsResponse || { totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 });
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL customers? This action cannot be undone!')) {
      return;
    }

    try {
      setDeleting(true);
      const result = await routeStarCustomerService.deleteAllCustomers();
      showSuccess(result.message);
      await loadData();
    } catch (error) {
      showError('Failed to delete customers: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSync = async () => {
    if (syncing) {
      showError('Sync already in progress. Please wait.');
      return;
    }

    if (!window.confirm('This will sync all customers from RouteStar. This may take several minutes. Continue?')) {
      return;
    }

    try {
      setSyncing(true);
      showSuccess('Sync started... This may take a few minutes.');
      const result = await routeStarCustomerService.syncCustomers();
      showSuccess(`Sync completed!`);
      await loadData();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        showError('Another sync is already in progress. Please wait for it to complete.');
      } else {
        showError('Failed to sync customers: ' + error.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDetails = async () => {
    if (syncingDetails) {
      showError('Details sync already in progress. Please wait.');
      return;
    }

    if (!window.confirm('This will fetch detailed information for all customers from RouteStar. This may take a very long time. Continue?')) {
      return;
    }

    try {
      setSyncingDetails(true);
      showSuccess('Details sync started... This will take several minutes.');
      const result = await routeStarCustomerService.syncCustomerDetails();
      showSuccess('Details sync started successfully! This will continue in the background.');
    } catch (error) {
      showError('Failed to start details sync: ' + error.message);
    } finally {
      setSyncingDetails(false);
    }
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          RouteStar Customers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage customer data from RouteStar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCustomers}</div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.activeCustomers}</div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</div>
              <div className="text-3xl font-bold text-gray-500 dark:text-gray-400 mt-1">{stats.inactiveCustomers}</div>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Search and Actions Row */}
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
            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                variant="primary"
                disabled={syncing}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </Button>
              <Button
                onClick={handleSyncDetails}
                variant="secondary"
                disabled={syncingDetails}
                className="flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-5 w-5 ${syncingDetails ? 'animate-spin' : ''}`} />
                {syncingDetails ? 'Syncing Details...' : 'Sync Details'}
              </Button>
              <Button
                onClick={handleDeleteAll}
                variant="danger"
                disabled={deleting}
                className="flex items-center gap-2"
              >
                <TrashIcon className="h-5 w-5" />
                {deleting ? 'Deleting...' : 'Delete All'}
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Select>

            <Input
              type="text"
              placeholder="Filter by Type..."
              value={selectedType !== 'all' ? selectedType : ''}
              onChange={(e) => setSelectedType(e.target.value || 'all')}
            />

            <Input
              type="text"
              placeholder="Filter by Sales Rep..."
              value={selectedSalesRep !== 'all' ? selectedSalesRep : ''}
              onChange={(e) => setSelectedSalesRep(e.target.value || 'all')}
            />

            <Input
              type="text"
              placeholder="Filter by Status..."
              value={selectedStatus !== 'all' ? selectedStatus : ''}
              onChange={(e) => setSelectedStatus(e.target.value || 'all')}
            />
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
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
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type & Rep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.customerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {customer.customerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <PhoneIcon className="h-4 w-4 mr-1" />
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
                        {customer.accountNumber && (
                          <div className="text-gray-900 dark:text-white">#{customer.accountNumber}</div>
                        )}
                        {customer.balance !== null && (
                          <div className={`font-medium ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${parseFloat(customer.balance).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {customer.customerType && (
                          <div className="text-gray-900 dark:text-white">{customer.customerType}</div>
                        )}
                        {customer.salesRep && (
                          <div className="text-gray-500 dark:text-gray-400">{customer.salesRep}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={customer.active ? 'success' : 'secondary'}>
                        {customer.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/routestar/customers/${customer.customerId}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalCount}</span> customers
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="secondary"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="secondary"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RouteStarCustomersList;
