import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Tag, CreditCard, Plus, Edit, Trash2, Calendar, Percent,
  DollarSign, Users, CheckCircle, XCircle, Clock, Package
} from 'lucide-react';

const CouponsAndPayments = () => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState('coupons'); 

  
  const [coupons, setCoupons] = useState([]);
  const [couponStats, setCouponStats] = useState({ active: 0, inactive: 0, expired: 0, total: 0 });
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minimumPurchase: 0,
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true,
  });

  
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    displayName: '',
    description: '',
    icon: 'credit-card',
    isActive: true,
    order: 0,
  });

  
  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons();
      fetchCouponStats();
    } else {
      fetchPaymentTypes();
    }
  }, [activeTab]);

  

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await api.get('/coupons');
      setCoupons(response?.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showError('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchCouponStats = async () => {
    try {
      const response = await api.get('/coupons/stats');
      setCouponStats(response?.stats || { active: 0, inactive: 0, expired: 0, total: 0 });
    } catch (error) {
      console.error('Error fetching coupon stats:', error);
      setCouponStats({ active: 0, inactive: 0, expired: 0, total: 0 });
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...couponForm,
        maxDiscount: couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : null,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, data);
        showSuccess('Coupon updated successfully');
      } else {
        await api.post('/coupons', data);
        showSuccess('Coupon created successfully');
      }

      setShowCouponModal(false);
      resetCouponForm();
      fetchCoupons();
      fetchCouponStats();
    } catch (error) {
      console.error('Error saving coupon:', error);
      showError(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumPurchase: coupon.minimumPurchase,
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      isActive: coupon.isActive,
    });
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await api.delete(`/coupons/${id}`);
      showSuccess('Coupon deleted successfully');
      fetchCoupons();
      fetchCouponStats();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showError('Failed to delete coupon');
    }
  };

  const resetCouponForm = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumPurchase: 0,
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
      isActive: true,
    });
  };

  

  const fetchPaymentTypes = async () => {
    setLoadingPayments(true);
    try {
      const response = await api.get('/payment-types');
      setPaymentTypes(response?.paymentTypes || []);
    } catch (error) {
      console.error('Error fetching payment types:', error);
      showError('Failed to load payment types');
      setPaymentTypes([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await api.put(`/payment-types/${editingPayment._id}`, paymentForm);
        showSuccess('Payment type updated successfully');
      } else {
        await api.post('/payment-types', paymentForm);
        showSuccess('Payment type created successfully');
      }

      setShowPaymentModal(false);
      resetPaymentForm();
      fetchPaymentTypes();
    } catch (error) {
      console.error('Error saving payment type:', error);
      showError(error.response?.data?.message || 'Failed to save payment type');
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      name: payment.name,
      displayName: payment.displayName,
      description: payment.description,
      icon: payment.icon,
      isActive: payment.isActive,
      order: payment.order,
    });
    setShowPaymentModal(true);
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment type?')) return;

    try {
      await api.delete(`/payment-types/${id}`);
      showSuccess('Payment type deleted successfully');
      fetchPaymentTypes();
    } catch (error) {
      console.error('Error deleting payment type:', error);
      showError('Failed to delete payment type');
    }
  };

  const resetPaymentForm = () => {
    setEditingPayment(null);
    setPaymentForm({
      name: '',
      displayName: '',
      description: '',
      icon: 'credit-card',
      isActive: true,
      order: 0,
    });
  };

  
  const isCouponExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const isCouponUsedUp = (coupon) => {
    return coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 lg:px-8 py-8 max-w-[1800px]">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
              <Tag className="w-7 h-7 text-white" />
            </div>
            Coupons & Payment Types
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2 ml-1">
            Manage discount coupons and payment methods
          </p>
        </div>

        {}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'coupons'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
            }`}
          >
            <Percent className="w-5 h-5" />
            Discount Coupons
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Payment Types
          </button>
        </div>

        {}
        {activeTab === 'coupons' && (
          <>
            {}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card padding="lg" className="border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Total Coupons</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {couponStats.total}
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500" />
                </div>
              </Card>
              <Card padding="lg" className="border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Active</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {couponStats.active}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </Card>
              <Card padding="lg" className="border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Inactive</p>
                    <p className="text-3xl font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {couponStats.inactive}
                    </p>
                  </div>
                  <XCircle className="w-12 h-12 text-slate-500" />
                </div>
              </Card>
              <Card padding="lg" className="border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Expired</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {couponStats.expired}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-red-500" />
                </div>
              </Card>
            </div>

            {/* Add Coupon Button */}
            <div className="mb-6">
              <Button
                onClick={() => {
                  resetCouponForm();
                  setShowCouponModal(true);
                }}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Coupon
              </Button>
            </div>

            {}
            {loadingCoupons ? (
              <LoadingSpinner />
            ) : coupons.length === 0 ? (
              <Card padding="lg" className="text-center py-20 border border-slate-200 dark:border-gray-700">
                <Tag className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No coupons yet
                </h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4">
                  Create your first discount coupon to get started
                </p>
                <Button onClick={() => setShowCouponModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Coupon
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {coupons.map((coupon) => {
                  const expired = isCouponExpired(coupon.expiryDate);
                  const usedUp = isCouponUsedUp(coupon);
                  const canUse = coupon.isActive && !expired && !usedUp;

                  return (
                    <Card
                      key={coupon._id}
                      padding="lg"
                      className="border border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {coupon.code}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                            {coupon.description}
                          </p>
                        </div>
                        {canUse ? (
                          <Badge variant="success">Active</Badge>
                        ) : expired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : usedUp ? (
                          <Badge variant="warning">Used Up</Badge>
                        ) : (
                          <Badge variant="default">Inactive</Badge>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-400">Discount:</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {coupon.discountType === 'fixed' ? '$' : ''}
                            {coupon.discountValue}
                            {coupon.discountType === 'percentage' ? '%' : ''}
                            {coupon.maxDiscount && ` (max $${coupon.maxDiscount})`}
                          </span>
                        </div>
                        {coupon.minimumPurchase > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-gray-400">Min. Purchase:</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              ${coupon.minimumPurchase}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-400">Usage:</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {coupon.usedCount}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' uses'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-400">Expires:</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCoupon(coupon)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Payment Types Tab */}
        {activeTab === 'payments' && (
          <>
            {/* Add Payment Type Button */}
            <div className="mb-6">
              <Button
                onClick={() => {
                  resetPaymentForm();
                  setShowPaymentModal(true);
                }}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Payment Type
              </Button>
            </div>

            {/* Payment Types List */}
            {loadingPayments ? (
              <LoadingSpinner />
            ) : paymentTypes.length === 0 ? (
              <Card padding="lg" className="text-center py-20 border border-slate-200 dark:border-gray-700">
                <CreditCard className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No payment types yet
                </h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4">
                  Add payment methods for your customers
                </p>
                <Button onClick={() => setShowPaymentModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Type
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentTypes.map((payment) => (
                  <Card
                    key={payment._id}
                    padding="lg"
                    className="border border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {payment.displayName}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-gray-400">
                            {payment.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant={payment.isActive ? 'success' : 'default'}>
                        {payment.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {payment.description && (
                      <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                        {payment.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePayment(payment._id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Coupon Modal */}
        <Modal
          isOpen={showCouponModal}
          onClose={() => {
            setShowCouponModal(false);
            resetCouponForm();
          }}
          title={editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          size="lg"
        >
          <form onSubmit={handleCouponSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Coupon Code"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER25"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <Select
                      value={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Select>
                  </div>
                </div>

                <Input
                  label="Description"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="25% off on all items"
                  required
                />
              </div>
            </div>

            {/* Discount Details Section */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Discount Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Discount Type"
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </Select>
                  <Input
                    label="Discount Value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Purchase ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.minimumPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minimumPurchase: parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    label="Max Discount (Optional)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
            </div>

            {/* Usage & Validity Section */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Usage & Validity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Usage Limit (Optional)"
                  type="number"
                  min="0"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCouponModal(false);
                  resetCouponForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
            </div>
          </form>
        </Modal>

        {/* Payment Type Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            resetPaymentForm();
          }}
          title={editingPayment ? 'Edit Payment Type' : 'Add Payment Type'}
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h3>
              <div className="space-y-4">
                <Input
                  label="Name (Internal)"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value.toLowerCase() })}
                  placeholder="cash"
                  required
                />

                <Input
                  label="Display Name"
                  value={paymentForm.displayName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, displayName: e.target.value })}
                  placeholder="Cash Payment"
                  required
                />

                <Input
                  label="Description (Optional)"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Pay with cash at counter"
                />
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-slate-50 dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Icon Name"
                  value={paymentForm.icon}
                  onChange={(e) => setPaymentForm({ ...paymentForm, icon: e.target.value })}
                  placeholder="credit-card"
                />
                <Input
                  label="Order"
                  type="number"
                  min="0"
                  value={paymentForm.order}
                  onChange={(e) => setPaymentForm({ ...paymentForm, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={paymentForm.isActive}
                  onChange={(e) => setPaymentForm({ ...paymentForm, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  resetPaymentForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingPayment ? 'Update' : 'Create'} Payment Type
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default CouponsAndPayments;
