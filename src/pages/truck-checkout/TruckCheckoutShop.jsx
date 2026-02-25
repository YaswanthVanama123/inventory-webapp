import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import inventoryService from '../../services/inventoryService';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  TruckIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  CubeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutShop = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { user } = useContext(AuthContext);

  // Inventory items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);

  // Cart
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Employee info for checkout
  const [employeeInfo, setEmployeeInfo] = useState({
    employeeName: user?.fullName || '',
    employeeId: user?._id || '',
    truckNumber: user?.truckNumber || '',
    notes: ''
  });

  // Update employee info when user data changes
  useEffect(() => {
    if (user) {
      setEmployeeInfo(prev => ({
        ...prev,
        employeeName: user.fullName || prev.employeeName,
        employeeId: user._id || prev.employeeId,
        truckNumber: user.truckNumber || prev.truckNumber
      }));
    }
  }, [user]);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item => {
        // Search in item name, SKU, category
        const matchesBasic =
          item.itemName?.toLowerCase().includes(query) ||
          item.skuCode?.toLowerCase().includes(query) ||
          item.categoryName?.toLowerCase().includes(query) ||
          item.canonicalName?.toLowerCase().includes(query);

        // Search in RouteStar aliases
        const matchesAlias = item.routeStarAliases?.some(alias =>
          alias.toLowerCase().includes(query)
        );

        return matchesBasic || matchesAlias;
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllForTruckCheckout();
      const itemsData = response.data?.items || [];
      setItems(itemsData);
      setFilteredItems(itemsData);
    } catch (error) {
      console.error('Load inventory error:', error);
      showError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const getMappedStats = () => {
    const mapped = filteredItems.filter(item => item.hasAliases).length;
    const unique = filteredItems.filter(item => !item.hasAliases).length;
    return { mapped, unique, total: filteredItems.length };
  };

  const addToCart = (item) => {
    const existingItem = cart.find(c => c._id === item._id);

    if (existingItem) {
      setCart(cart.map(c =>
        c._id === item._id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
      showSuccess(`Increased ${item.itemName} quantity`);
    } else {
      setCart([...cart, {
        _id: item._id,
        name: item.itemName,
        sku: item.skuCode,
        quantity: 1,
        currentStock: item.quantity,
        notes: ''
      }]);
      showSuccess(`Added ${item.itemName} to cart`);
    }
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(c =>
      c._id === itemId
        ? { ...c, quantity: newQuantity }
        : c
    ));
  };

  const removeFromCart = (itemId) => {
    const item = cart.find(c => c._id === itemId);
    setCart(cart.filter(c => c._id !== itemId));
    if (item) {
      showSuccess(`Removed ${item.name} from cart`);
    }
  };

  const updateCartItemNotes = (itemId, notes) => {
    setCart(cart.map(c =>
      c._id === itemId
        ? { ...c, notes }
        : c
    ));
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckoutToTruck = () => {
    if (cart.length === 0) {
      showError('Please add items to cart first');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleSubmitCheckout = async () => {
    if (!employeeInfo.employeeName.trim()) {
      showError('Please enter employee name');
      return;
    }

    try {
      setSubmitting(true);
      const checkoutData = {
        employeeName: employeeInfo.employeeName,
        employeeId: employeeInfo.employeeId,
        truckNumber: employeeInfo.truckNumber,
        notes: employeeInfo.notes,
        itemsTaken: cart.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          notes: item.notes
        }))
      };

      await truckCheckoutService.createCheckout(checkoutData);
      showSuccess('Truck checkout created successfully');
      navigate('/truck-checkouts');
    } catch (error) {
      console.error('Checkout error:', error);
      showError(error.response?.data?.message || 'Failed to create checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemInCart = (itemId) => {
    return cart.find(c => c._id === itemId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Main Content - Inventory Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <TruckIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  New Truck Checkout
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Select RouteStar items to load into the truck
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/truck-checkouts')}
              >
                Back to Checkouts
              </Button>
            </div>

            {/* Stats Cards */}
            {filteredItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Items</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{getMappedStats().total}</p>
                    </div>
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Mapped Items</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{getMappedStats().mapped}</p>
                    </div>
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Unique Items</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{getMappedStats().unique}</p>
                    </div>
                    <div className="bg-green-500 p-3 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items by name, SKU, category, or RouteStar alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No items found matching your search' : 'No inventory items available'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const cartItem = getItemInCart(item._id);
                const inCart = !!cartItem;

                return (
                  <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Image Area */}
                    <div className="relative bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center" style={{ height: '180px' }}>
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.itemName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <CubeIcon className="w-20 h-20 text-gray-300 dark:text-gray-600" />
                      )}

                      {/* Stock Badge - Top Right */}
                      <div className="absolute top-2 right-2">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.quantity > 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            Stock: {item.quantity}
                          </span>
                          {(item.totalPurchased > 0 || item.totalSold > 0) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {item.totalPurchased}P / {item.totalSold}S
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 space-y-3">
                      {/* Item Name */}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 min-h-[48px]">
                        {item.canonicalName}
                      </h3>

                      {/* SKU */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {item.skuCode}
                      </p>

                      {/* Tags Row */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.categoryName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {item.categoryName}
                          </span>
                        )}
                        {item.hasAliases && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            <TagIcon className="w-3 h-3" />
                            {item.routeStarAliases.length} aliases
                          </span>
                        )}
                        {item.itemCount > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                            {item.itemCount} variants
                          </span>
                        )}
                      </div>

                      {/* Aliases Section */}
                      {item.hasAliases && item.routeStarAliases && item.routeStarAliases.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Also known as:
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                            {item.routeStarAliases.slice(0, 3).join(', ')}
                            {item.routeStarAliases.length > 3 && ` +${item.routeStarAliases.length - 3} more`}
                          </p>
                        </div>
                      )}

                      {/* Stock Breakdown */}
                      {(item.totalPurchased > 0 || item.totalSold > 0) && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                            Stock Details:
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <p className="text-blue-600 dark:text-blue-400 font-semibold">{item.totalPurchased}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-[10px]">Purchased</p>
                            </div>
                            <div className="text-center p-1.5 bg-green-50 dark:bg-green-900/20 rounded">
                              <p className="text-green-600 dark:text-green-400 font-semibold">{item.totalSold}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-[10px]">Sold</p>
                            </div>
                            <div className="text-center p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded">
                              <p className="text-purple-600 dark:text-purple-400 font-semibold">{item.quantity}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-[10px]">Available</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <Button
                        variant={inCart ? 'success' : 'primary'}
                        size="sm"
                        onClick={() => addToCart(item)}
                        disabled={item.quantity <= 0}
                        className="w-full mt-2"
                      >
                        {inCart ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            In Cart ({cartItem.quantity})
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <PlusIcon className="w-4 h-4" />
                            Add to Cart
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCartIcon className="w-6 h-6" />
            Cart ({getTotalItems()} items)
          </h2>
        </div>

        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Your cart is empty
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Add items from the inventory
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {item.name}
                        </h3>
                        {item.sku && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item._id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        Stock: {item.currentStock}
                      </span>
                    </div>

                    {/* Item Notes */}
                    <Input
                      placeholder="Optional notes for this item"
                      value={item.notes}
                      onChange={(e) => updateCartItemNotes(item._id, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                onClick={handleCheckoutToTruck}
                className="w-full"
                size="lg"
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                Checkout to Truck
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckoutModal}
        onClose={() => !submitting && setShowCheckoutModal(false)}
        title="Checkout to Truck"
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowCheckoutModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitCheckout}
              loading={submitting}
            >
              Complete Checkout
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Employee Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Employee Information
              </h3>
              {user && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Auto-filled from your profile
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Employee Name"
                required
                value={employeeInfo.employeeName}
                onChange={(e) => setEmployeeInfo({ ...employeeInfo, employeeName: e.target.value })}
                placeholder="Enter employee name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Employee ID"
                  value={employeeInfo.employeeId}
                  onChange={(e) => setEmployeeInfo({ ...employeeInfo, employeeId: e.target.value })}
                  placeholder="Optional"
                />
                <Input
                  label="Truck Number"
                  value={employeeInfo.truckNumber}
                  onChange={(e) => setEmployeeInfo({ ...employeeInfo, truckNumber: e.target.value })}
                  placeholder="Enter truck number"
                />
              </div>
              <Textarea
                label="Additional Notes"
                value={employeeInfo.notes}
                onChange={(e) => setEmployeeInfo({ ...employeeInfo, notes: e.target.value })}
                placeholder="Enter any additional notes about this checkout"
                rows={3}
              />
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Items Summary ({getTotalItems()} items)
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    {item.sku && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.sku}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    × {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TruckCheckoutShop;
