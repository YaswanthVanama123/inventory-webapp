import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import {
  TruckIcon,
  PlusIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutList = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);
  const { isAdmin } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('checkouts');
  const [checkoutsSubTab, setCheckoutsSubTab] = useState('all');
  const [salesSubTab, setSalesSubTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [checkouts, setCheckouts] = useState([]);
  const [salesTracking, setSalesTracking] = useState([]);
  const [salesSummary, setSalesSummary] = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 });
  const [employees, setEmployees] = useState([]);
  const [salesEmployees, setSalesEmployees] = useState([]);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [expandedSalesEmployee, setExpandedSalesEmployee] = useState(null);
  const [employeeCheckouts, setEmployeeCheckouts] = useState([]);
  const [employeeSalesTracking, setEmployeeSalesTracking] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCheckout, setExpandedCheckout] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [checkoutToDelete, setCheckoutToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (activeTab === 'checkouts') {
      if (checkoutsSubTab === 'all') {
        loadCheckouts();
      } else if (checkoutsSubTab === 'employees') {
        loadEmployees();
      }
    } else if (activeTab === 'sales') {
      if (salesSubTab === 'all') {
        loadSalesTracking();
      } else if (salesSubTab === 'employees') {
        loadSalesEmployees();
      }
    }
  }, [statusFilter, employeeFilter, pagination.page, startDate, endDate, activeTab, checkoutsSubTab, salesSubTab]);
  const loadCheckouts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (employeeFilter.trim()) params.employeeName = employeeFilter.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await truckCheckoutService.getCheckouts(params);
      setCheckouts(response.data.checkouts || []);
      setPagination(response.data.pagination || { total: 0, page: 1, limit: 50, pages: 0 });
    } catch (error) {
      console.error('Load checkouts error:', error);
      showError('Failed to load checkouts');
    } finally {
      setLoading(false);
    }
  };
  const loadSalesTracking = async () => {
    try {
      setLoading(true);
      const params = {};
      if (employeeFilter.trim()) params.employeeName = employeeFilter.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await truckCheckoutService.getSalesTracking(params);
      setSalesTracking(response.data.checkouts || []);
      setSalesSummary(response.data.summary || {});
    } catch (error) {
      console.error('Load sales tracking error:', error);
      showError('Failed to load sales tracking');
    } finally {
      setLoading(false);
    }
  };
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const response = await truckCheckoutService.getAllEmployeesWithStats(params);
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Load employees error:', error);
      showError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  const loadSalesEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await truckCheckoutService.getSalesTracking(params);
      const allSalesTracking = response.data.checkouts || [];
      const employeeMap = new Map();
      allSalesTracking.forEach(item => {
        const key = `${item.employeeName}-${item.truckNumber || 'N/A'}`;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            employeeName: item.employeeName,
            truckNumber: item.truckNumber || 'N/A',
            items: []
          });
        }
        employeeMap.get(key).items.push(item);
      });
      const groupedEmployees = Array.from(employeeMap.values()).map(emp => ({
        ...emp,
        totalCheckouts: emp.items.length,
        goodCount: emp.items.filter(i => i.status === 'Good').length,
        shortageCount: emp.items.filter(i => i.status === 'Shortage').length,
        overageCount: emp.items.filter(i => i.status === 'Overage').length
      }));
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        setSalesEmployees(groupedEmployees.filter(emp =>
          emp.employeeName.toLowerCase().includes(searchLower) ||
          emp.truckNumber.toLowerCase().includes(searchLower)
        ));
      } else {
        setSalesEmployees(groupedEmployees);
      }
    } catch (error) {
      console.error('Load sales employees error:', error);
      showError('Failed to load sales employees');
    } finally {
      setLoading(false);
    }
  };
  const loadEmployeeCheckouts = async (employeeName) => {
    try {
      setLoading(true);
      const params = {
        employeeName,
        page: 1,
        limit: 100
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await truckCheckoutService.getCheckouts(params);
      setEmployeeCheckouts(response.data.checkouts || []);
      setExpandedEmployee(employeeName);
    } catch (error) {
      console.error('Load employee checkouts error:', error);
      showError('Failed to load employee checkouts');
    } finally {
      setLoading(false);
    }
  };
  const handleEmployeeExpand = (employeeName) => {
    if (expandedEmployee === employeeName) {
      setExpandedEmployee(null);
      setEmployeeCheckouts([]);
    } else {
      loadEmployeeCheckouts(employeeName);
    }
  };
  const handleSalesEmployeeExpand = (employeeName) => {
    if (expandedSalesEmployee === employeeName) {
      setExpandedSalesEmployee(null);
      setEmployeeSalesTracking([]);
    } else {
      loadEmployeeSalesTracking(employeeName);
    }
  };
  const loadEmployeeSalesTracking = async (employeeName) => {
    try {
      setLoading(true);
      const params = {
        employeeName
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await truckCheckoutService.getSalesTracking(params);
      setEmployeeSalesTracking(response.data.checkouts || []);
      setExpandedSalesEmployee(employeeName);
    } catch (error) {
      console.error('Load employee sales tracking error:', error);
      showError('Failed to load employee sales tracking');
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    setStatusFilter('all');
    setEmployeeFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  const getStatusBadge = (status) => {
    const config = {
      checked_out: { variant: 'info', label: 'Checked Out', icon: ClockIcon },
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
  const handleRowClick = (checkoutId) => {
    navigate(`/truck-checkouts/${checkoutId}`);
  };
  const handleEmployeeClick = (employeeName, e) => {
    e.stopPropagation();
    navigate(`/truck-checkouts/employee/${employeeName}`);
  };
  const handleDelete = async (checkoutId, e) => {
    e.stopPropagation();
    setCheckoutToDelete(checkoutId);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!checkoutToDelete) return;
    try {
      setDeleting(true);
      await truckCheckoutService.deleteCheckout(checkoutToDelete);
      showSuccess('Checkout deleted successfully');
      setShowDeleteModal(false);
      setCheckoutToDelete(null);
      loadCheckouts();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete checkout');
    } finally {
      setDeleting(false);
    }
  };
  if (loading && checkouts.length === 0 && employees.length === 0 && salesTracking.length === 0 && salesEmployees.length === 0) {
    return <LoadingSpinner />;
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Truck Checkouts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin
                ? 'Manage all truck checkouts across employees'
                : 'Track items taken by employees in trucks'}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/truck-checkouts/new')}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Checkout
        </Button>
      </div>
      {!isAdmin && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('checkouts')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'checkouts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Checkouts
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sales & Remaining
            </button>
          </div>
        </div>
      )}
      {isAdmin && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('checkouts')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'checkouts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Checkouts
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sales & Remaining
            </button>
          </div>
        </div>
      )}
      {activeTab === 'checkouts' && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-1 px-4">
            <button
              onClick={() => setCheckoutsSubTab('all')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                checkoutsSubTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Checkouts
            </button>
            <button
              onClick={() => setCheckoutsSubTab('employees')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                checkoutsSubTab === 'employees'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Organize by Employees
            </button>
          </div>
        </div>
      )}
      {activeTab === 'sales' && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex gap-1 px-4">
            <button
              onClick={() => setSalesSubTab('all')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                salesSubTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Sales
            </button>
            <button
              onClick={() => setSalesSubTab('employees')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                salesSubTab === 'employees'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Organize by Employees
            </button>
          </div>
        </div>
      )}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {checkoutsSubTab === 'all' && activeTab === 'checkouts' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="all">All Status</option>
                <option value="checked_out">Checked Out</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          )}
          {(checkoutsSubTab === 'employees' && activeTab === 'checkouts') || (salesSubTab === 'employees' && activeTab === 'sales') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by truck or employee name"
                  className="pl-10"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          ) : (activeTab === 'checkouts' && checkoutsSubTab === 'all') || (activeTab === 'sales' && salesSubTab === 'all') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Name
              </label>
              <Input
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="Filter by employee name"
              />
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>
      {activeTab === 'checkouts' && checkoutsSubTab === 'all' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Checkouts ({pagination.total} records)
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {checkouts.length === 0 ? (
              <div className="p-12 text-center">
                <TruckIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Checkouts Found</h3>
                <p className="text-slate-500">Checkouts will appear here when items are checked out</p>
              </div>
            ) : (
              checkouts.map((checkout) => {
                const isExpanded = expandedCheckout === checkout._id;
                const itemDisplay = checkout.itemName
                  ? { name: checkout.itemName, qty: checkout.quantityTaking || 0 }
                  : { name: `${checkout.itemsTaken?.length || 0} items`, qty: checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0 };
                return (
                  <div key={checkout._id}>
                    {/* Row Header - Clickable */}
                    <div
                      onClick={() => setExpandedCheckout(isExpanded ? null : checkout._id)}
                      className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Expand Icon */}
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDownIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Item & Employee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {itemDisplay.name}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Qty: {itemDisplay.qty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-blue-600">
                            {checkout.employeeName}
                          </span>
                          <span className="text-xs text-slate-400">
                            Truck: {checkout.truckNumber || '-'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(checkout.checkoutDate)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {getStatusBadge(checkout.status)}

                      {/* Delete Button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDelete(checkout._id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="px-6 pb-5 bg-blue-50/30 border-t border-slate-100">
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Employee & Truck Details */}
                          <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-slate-500" />
                              Employee & Truck
                            </h4>
                            <dl className="space-y-2.5">
                              <div className="flex justify-between">
                                <dt className="text-xs text-slate-500">Employee</dt>
                                <dd className="text-sm font-medium text-blue-600">
                                  <button
                                    onClick={(e) => handleEmployeeClick(checkout.employeeName, e)}
                                    className="hover:underline"
                                  >
                                    {checkout.employeeName}
                                  </button>
                                </dd>
                              </div>
                              {checkout.employeeId && (
                                <div className="flex justify-between">
                                  <dt className="text-xs text-slate-500">Employee ID</dt>
                                  <dd className="text-sm text-slate-900">{checkout.employeeId}</dd>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <dt className="text-xs text-slate-500">Truck</dt>
                                <dd className="text-sm font-medium text-slate-900">{checkout.truckNumber || 'N/A'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-xs text-slate-500">Status</dt>
                                <dd>{getStatusBadge(checkout.status)}</dd>
                              </div>
                            </dl>
                          </div>

                          {/* Items Detail */}
                          <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <CubeIcon className="w-4 h-4 text-slate-500" />
                              Items
                            </h4>
                            {checkout.itemName ? (
                              <dl className="space-y-2.5">
                                <div className="flex justify-between">
                                  <dt className="text-xs text-slate-500">Item</dt>
                                  <dd className="text-sm font-medium text-slate-900 text-right max-w-[180px] truncate">{checkout.itemName}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-xs text-slate-500">Quantity</dt>
                                  <dd className="text-sm font-bold text-slate-900">{checkout.quantityTaking || 0}</dd>
                                </div>
                                {checkout.itemSku && (
                                  <div className="flex justify-between">
                                    <dt className="text-xs text-slate-500">SKU</dt>
                                    <dd className="text-sm text-slate-900">{checkout.itemSku}</dd>
                                  </div>
                                )}
                              </dl>
                            ) : checkout.itemsTaken && checkout.itemsTaken.length > 0 ? (
                              <div className="space-y-2">
                                {checkout.itemsTaken.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                                    <span className="text-sm text-slate-700 truncate max-w-[140px]">{item.itemName || item.name}</span>
                                    <span className="text-sm font-semibold text-slate-900">x{item.quantity}</span>
                                  </div>
                                ))}
                                {checkout.itemsTaken.length > 5 && (
                                  <p className="text-xs text-slate-500 pt-1">+{checkout.itemsTaken.length - 5} more items</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No items</p>
                            )}
                          </div>

                          {/* Timing & Invoices */}
                          <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-slate-500" />
                              Timing & Invoices
                            </h4>
                            <dl className="space-y-2.5">
                              <div className="flex justify-between">
                                <dt className="text-xs text-slate-500">Checkout Date</dt>
                                <dd className="text-sm text-slate-900">{formatDate(checkout.checkoutDate)}</dd>
                              </div>
                              {checkout.completedDate && (
                                <div className="flex justify-between">
                                  <dt className="text-xs text-slate-500">Completed</dt>
                                  <dd className="text-sm text-slate-900">{formatDate(checkout.completedDate)}</dd>
                                </div>
                              )}
                              <div className="pt-2 border-t border-slate-100">
                                <dt className="text-xs text-slate-500 mb-2">Invoices</dt>
                                {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 ? (
                                  <div className="space-y-1">
                                    {checkout.invoiceNumbers.map((inv, idx) => (
                                      <dd key={idx} className="text-sm text-slate-900 bg-slate-50 rounded px-2 py-1">
                                        {inv}
                                      </dd>
                                    ))}
                                  </div>
                                ) : (
                                  <dd className="text-sm text-slate-400 italic">No invoices</dd>
                                )}
                              </div>
                            </dl>
                          </div>
                        </div>
                        {/* View Full Detail Link */}
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => handleRowClick(checkout._id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            View Full Details →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'checkouts' && checkoutsSubTab === 'employees' && (
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6" />
              Employees ({employees.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click on an employee to view their checkouts
            </p>
          </div>
          <div className="space-y-2">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No employees found
              </div>
            ) : (
              employees.map((employee) => (
                <div key={`${employee.employeeName}-${employee.truckNumber}`} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => handleEmployeeExpand(employee.employeeName)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {employee.employeeName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Truck: {employee.truckNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.totalCheckouts} checkouts
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {employee.activeCheckouts} active, {employee.completedCheckouts} completed
                        </p>
                      </div>
                      <ChevronRightIcon
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedEmployee === employee.employeeName ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expandedEmployee === employee.employeeName && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      {loading ? (
                        <div className="px-6 py-8 text-center">
                          <LoadingSpinner />
                        </div>
                      ) : employeeCheckouts.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No checkouts found for this employee
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Checkout Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Invoices
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {employeeCheckouts.map((checkout) => (
                                <tr
                                  key={checkout._id}
                                  onClick={() => handleRowClick(checkout._id)}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                  <td className="px-6 py-4">
                                    <div className="text-sm">
                                      {checkout.itemName ? (
                                        <>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {checkout.itemName}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Qty: {checkout.quantityTaking || 0}
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="font-medium text-gray-900 dark:text-white">
                                            {checkout.itemsTaken?.length || 0} items
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Total qty: {checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {formatDate(checkout.checkoutDate)}
                                  </td>
                                  <td className="px-6 py-4">
                                    {getStatusBadge(checkout.status)}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 ? (
                                      <span className="font-medium">{checkout.invoiceNumbers.length} invoices</span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
      {activeTab === 'sales' && salesSubTab === 'all' && (
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sales & Remaining Tracking
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track what was sold vs what was checked out
            </p>
          </div>
          {salesSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Good (Matched)</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{salesSummary.good || 0}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Shortage</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{salesSummary.shortage || 0}</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Overage</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">{salesSummary.overage || 0}</p>
                  </div>
                  <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Truck
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Checked Out
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Invoices
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {salesTracking.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No sales tracking data found
                    </td>
                  </tr>
                ) : (
                  salesTracking.map((item) => (
                    <tr
                      key={item.checkoutId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.truckNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {item.quantityCheckedOut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                        {item.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {item.remaining}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'Good' && (
                          <Badge variant="success">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Good
                          </Badge>
                        )}
                        {item.status === 'Shortage' && (
                          <Badge variant="info">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            Shortage
                          </Badge>
                        )}
                        {item.status === 'Overage' && (
                          <Badge variant="danger">
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Overage
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.matchedInvoices} matched
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {activeTab === 'sales' && salesSubTab === 'employees' && (
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserGroupIcon className="w-6 h-6" />
              Employees ({salesEmployees.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click on an employee to view their sales tracking
            </p>
          </div>
          <div className="space-y-2">
            {salesEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No employees found
              </div>
            ) : (
              salesEmployees.map((employee) => (
                <div key={`${employee.employeeName}-${employee.truckNumber}`} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => handleSalesEmployeeExpand(employee.employeeName)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {employee.employeeName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Truck: {employee.truckNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.totalCheckouts} items tracked
                        </p>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="text-green-600 dark:text-green-400">{employee.goodCount} good</span>
                          <span className="text-blue-600 dark:text-blue-400">{employee.shortageCount} shortage</span>
                          <span className="text-red-600 dark:text-red-400">{employee.overageCount} overage</span>
                        </div>
                      </div>
                      <ChevronRightIcon
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedSalesEmployee === employee.employeeName ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expandedSalesEmployee === employee.employeeName && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      {loading ? (
                        <div className="px-6 py-8 text-center">
                          <LoadingSpinner />
                        </div>
                      ) : employeeSalesTracking.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No sales tracking data found for this employee
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Item
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Checked Out
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Sold
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Remaining
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                  Invoices
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {employeeSalesTracking.map((item) => (
                                <tr
                                  key={item.checkoutId}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {item.itemName}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                                    {item.quantityCheckedOut}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                                    {item.totalSold}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                                    {item.remaining}
                                  </td>
                                  <td className="px-6 py-4">
                                    {item.status === 'Good' && (
                                      <Badge variant="success">
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Good
                                      </Badge>
                                    )}
                                    {item.status === 'Shortage' && (
                                      <Badge variant="info">
                                        <ClockIcon className="w-4 h-4 mr-1" />
                                        Shortage
                                      </Badge>
                                    )}
                                    {item.status === 'Overage' && (
                                      <Badge variant="danger">
                                        <XCircleIcon className="w-4 h-4 mr-1" />
                                        Overage
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    {item.matchedInvoices} matched
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      )}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Checkout"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleting}
            >
              Delete Checkout
            </Button>
          </>
        }
      >
        <Alert variant="danger" title="Warning">
          This will permanently delete this checkout. This action cannot be undone!
        </Alert>
      </Modal>
    </div>
  );
};
export default TruckCheckoutList;
