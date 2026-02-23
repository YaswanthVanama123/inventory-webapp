import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const TruckCheckoutShop = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

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
    employeeName: '',
    employeeId: '',
    truckNumber: '',
    notes: ''
  });

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
      setItems(response.data?.items || []);
      setFilteredItems(response.data?.items || []);
    } catch (error) {
      console.error('Load inventory error:', error);
      showError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  New Truck Checkout
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Select items to load into the truck
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/truck-checkouts')}
              >
                Back to Checkouts
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items by name, SKU, or category..."
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
                  <Card key={item._id} className="hover:shadow-lg transition-shadow">
                    <div className="flex flex-col h-full">
                      {/* Item Image */}
                      <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">📦</div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {item.itemName}
                        </h3>
                        {item.skuCode && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            SKU: {item.skuCode}
                          </p>
                        )}
                        {item.hasAliases && item.routeStarAliases && item.routeStarAliases.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                              Also known as:
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.routeStarAliases.join(', ')}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={item.quantity > 0 ? 'success' : 'danger'} size="sm">
                            Stock: {item.quantity}
                          </Badge>
                          {item.categoryName && (
                            <Badge variant="info" size="sm">
                              {item.categoryName}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        variant={inCart ? 'success' : 'primary'}
                        size="sm"
                        onClick={() => addToCart(item)}
                        disabled={item.quantity <= 0}
                        className="w-full"
                      >
                        {inCart ? (
                          <>
                            <ShoppingCartIcon className="w-4 h-4 mr-2" />
                            In Cart ({cartItem.quantity})
                          </>
                        ) : (
                          <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
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
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Employee Information
            </h3>
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
                  placeholder="Optional"
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
