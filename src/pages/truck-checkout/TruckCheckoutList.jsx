import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
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
  TrashIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutList = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [checkouts, setCheckouts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [checkoutToDelete, setCheckoutToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCheckouts();
  }, [statusFilter, employeeFilter, pagination.page]);

  const loadCheckouts = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (employeeFilter.trim()) params.employeeName = employeeFilter.trim();

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
      loadCheckouts(); // Reload the list
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete checkout');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && checkouts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Truck Checkouts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track items taken by employees in trucks
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

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setStatusFilter('all');
                setEmployeeFilter('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Checkouts Table */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Checkouts ({pagination.total} records)
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Truck
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Checkout Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoices
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {checkouts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No checkouts found
                  </td>
                </tr>
              ) : (
                checkouts.map((checkout) => (
                  <tr
                    key={checkout._id}
                    onClick={() => handleRowClick(checkout._id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <button
                          onClick={(e) => handleEmployeeClick(checkout.employeeName, e)}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {checkout.employeeName}
                        </button>
                        {checkout.employeeId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ID: {checkout.employeeId}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {checkout.truckNumber || '-'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {checkout.itemsTaken?.length || 0} items
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Total qty: {checkout.itemsTaken?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(checkout.checkoutDate)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(checkout.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {checkout.invoiceNumbers && checkout.invoiceNumbers.length > 0 ? (
                        <span className="font-medium">{checkout.invoiceNumbers.length} invoices</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(checkout._id, e)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                      return <span key={page} className="px-2 py-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
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
