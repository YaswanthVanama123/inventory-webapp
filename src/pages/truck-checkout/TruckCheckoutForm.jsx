import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { AuthContext } from '../../contexts/AuthContext';
import truckCheckoutService from '../../services/truckCheckoutService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import { TruckIcon, MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const TruckCheckoutForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);
  const { user } = useContext(AuthContext);
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
    checkoutDate: new Date().toISOString().split('T')[0]
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [quantityTaking, setQuantityTaking] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [discrepancyInfo, setDiscrepancyInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Truck inventory validation states
  const [actualTruckInventory, setActualTruckInventory] = useState('');
  const [truckInventory, setTruckInventory] = useState(null);
  const [loadingTruckInventory, setLoadingTruckInventory] = useState(false);
  const [truckDiscrepancyInfo, setTruckDiscrepancyInfo] = useState(null);
  useEffect(() => {
    if (!showItemPicker) {
      setSearchQuery(''); 
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      searchItems();
    }, searchQuery ? 300 : 0); 
    return () => clearTimeout(delayDebounce);
  }, [showItemPicker, searchQuery]);
  const searchItems = async () => {
    try {
      setSearching(true);
      const response = await truckCheckoutService.searchItems(searchQuery, true, 100);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search items error:', error);
      showError('Failed to search items');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleItemSelect = async (item) => {
    setSelectedItem(item);
    setShowItemPicker(false);
    setValidationError('');
    setQuantityTaking('');
    setRemainingQuantity('');
    setActualTruckInventory('');
    setTruckInventory(null);

    // Fetch truck inventory when item is selected
    if (user?.truckNumber) {
      try {
        setLoadingTruckInventory(true);
        const response = await truckCheckoutService.getTruckInventory(
          user.truckNumber,
          item.itemName,
          user.fullName
        );
        setTruckInventory(response.data);
        console.log('[TruckCheckout] Current truck inventory:', response.data.currentTruckInventory);
      } catch (error) {
        console.error('[TruckCheckout] Failed to get truck inventory:', error);
        setTruckInventory(null);
      } finally {
        setLoadingTruckInventory(false);
      }
    }
  };
  const handleQuantityTakingChange = (e) => {
    setQuantityTaking(e.target.value);
    setValidationError('');
  };
  const handleRemainingQuantityChange = (e) => {
    setRemainingQuantity(e.target.value);
    setValidationError('');
  };
  const validateStockMath = () => {
    if (!selectedItem || !quantityTaking || !remainingQuantity) {
      return true;
    }
    const taking = parseFloat(quantityTaking);
    const remaining = parseFloat(remainingQuantity);
    const currentStock = selectedItem.currentStock || 0;
    const expectedRemaining = currentStock - taking;
    if (Math.abs(remaining - expectedRemaining) > 0.001) {
      const difference = remaining - expectedRemaining;
      const discrepancyType = difference > 0 ? 'Overage' : 'Shortage';
      const error = `${discrepancyType} Detected: Expected remaining is ${expectedRemaining.toFixed(2)}, but you entered ${remaining}. Difference: ${Math.abs(difference).toFixed(2)} (${discrepancyType})`;
      setValidationError(error);
      return false;
    }
    setValidationError('');
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.fullName?.trim()) {
      showError('Employee name is required. Please update your profile.');
      return;
    }
    if (!user.truckNumber?.trim()) {
      showError('Route name is required. Please update your profile.');
      return;
    }
    if (!selectedItem) {
      showError('Please select an item');
      return;
    }
    const taking = parseFloat(quantityTaking);
    const remaining = parseFloat(remainingQuantity);
    if (!taking || taking <= 0) {
      showError('Please enter a valid quantity to take');
      return;
    }
    if (isNaN(remaining)) {
      showError('Please enter remaining quantity');
      return;
    }

    // Detect stock discrepancy
    let stockDisc = null;
    if (!validateStockMath()) {
      const currentStock = selectedItem.currentStock || 0;
      const expectedRemaining = currentStock - taking;
      const difference = remaining - expectedRemaining;
      stockDisc = {
        itemName: selectedItem.itemName,
        currentStock,
        taking,
        expectedRemaining: expectedRemaining.toFixed(2),
        userEnteredRemaining: remaining,
        difference: difference.toFixed(2),
        discrepancyType: difference > 0 ? 'Overage' : 'Shortage',
      };
    }

    // Detect truck inventory discrepancy
    let truckDisc = null;
    if (actualTruckInventory && actualTruckInventory.trim() !== '') {
      const actualTruck = parseFloat(actualTruckInventory);
      if (isNaN(actualTruck) || actualTruck < 0) {
        showError('Please enter a valid truck inventory quantity');
        return;
      }
      if (truckInventory) {
        const expectedTruckAfterCheckout = truckInventory.currentTruckInventory + taking;
        const truckDifference = actualTruck - expectedTruckAfterCheckout;
        if (Math.abs(truckDifference) > 0.01) {
          truckDisc = {
            itemName: selectedItem.itemName,
            currentTruckInventory: truckInventory.currentTruckInventory,
            quantityTaking: taking,
            expectedTruckInventory: expectedTruckAfterCheckout,
            actualTruckInventory: actualTruck,
            truckDiscrepancyDifference: truckDifference,
            truckDiscrepancyType: truckDifference > 0 ? 'Overage' : 'Shortage',
          };
        }
      }
    }

    // Show combined modal if either discrepancy exists
    if (stockDisc || truckDisc) {
      setDiscrepancyInfo(stockDisc);
      setTruckDiscrepancyInfo(truckDisc);
      setShowDiscrepancyModal(true);
      return;
    }

    await submitCheckout(false, false);
  };
  const submitCheckout = async (acceptDiscrepancy, acceptTruckDiscrepancy) => {
    try {
      setSubmitting(true);
      const checkoutData = {
        employeeName: user.fullName.trim(),
        truckNumber: user.truckNumber.trim(),
        itemName: selectedItem.itemName,
        quantityTaking: parseFloat(quantityTaking),
        remainingQuantity: parseFloat(remainingQuantity),
        actualTruckInventory: actualTruckInventory && actualTruckInventory.trim() !== ''
          ? parseFloat(actualTruckInventory)
          : undefined,
        notes: formData.notes.trim(),
        checkoutDate: formData.checkoutDate ? new Date(formData.checkoutDate).toISOString() : new Date().toISOString(),
        acceptDiscrepancy,
        acceptTruckDiscrepancy,
      };
      console.log('[TruckCheckout] Submitting:', checkoutData);
      const response = await truckCheckoutService.createCheckoutNew(checkoutData);

      if (!response.success && (response.requiresConfirmation || response.requiresTruckConfirmation)) {
        if (response.requiresConfirmation) {
          const validation = response.validation;
          setDiscrepancyInfo({
            itemName: selectedItem.itemName,
            currentStock: validation.currentStock,
            taking: validation.quantityTaking,
            expectedRemaining: validation.systemCalculatedRemaining,
            userEnteredRemaining: validation.userRemainingQuantity,
            difference: validation.discrepancyDifference,
            discrepancyType: validation.discrepancyType,
          });
        }
        if (response.requiresTruckConfirmation) {
          const truckValidation = response.truckInventoryValidation;
          setTruckDiscrepancyInfo({
            itemName: selectedItem.itemName,
            currentTruckInventory: truckValidation.currentTruckInventoryBeforeCheckout,
            quantityTaking: parseFloat(quantityTaking),
            expectedTruckInventory: truckValidation.expectedTruckInventory,
            actualTruckInventory: truckValidation.actualTruckInventory,
            truckDiscrepancyDifference: truckValidation.truckDiscrepancyDifference,
            truckDiscrepancyType: truckValidation.truckDiscrepancyType,
          });
        }
        setShowDiscrepancyModal(true);
        return;
      }

      if (response.success) {
        setShowDiscrepancyModal(false);
        showSuccess(
          response.discrepancy || response.truckDiscrepancy
            ? 'Checkout created with discrepancy adjustment'
            : 'Checkout created successfully'
        );
        navigate('/truck-checkouts');
      }
    } catch (error) {
      console.error('Create checkout error:', error);
      showError(error.response?.data?.message || 'Failed to create checkout');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            New Truck Checkout
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Select single item to check out with stock validation
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="employeeName"
                value={user?.fullName || 'Not set'}
                disabled
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Route Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="truckNumber"
                value={user?.truckNumber || 'Not set'}
                disabled
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Checkout Date
              </label>
              <Input
                type="date"
                name="checkoutDate"
                value={formData.checkoutDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </Card>
        {}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Item
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Item <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowItemPicker(true)}
                className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span>
                  {selectedItem ? (
                    <div>
                      <div className="font-medium">{selectedItem.itemName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Current Stock: {selectedItem.currentStock || 0}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Click to select item</span>
                  )}
                </span>
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity Taking <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={quantityTaking}
                  onChange={handleQuantityTakingChange}
                  placeholder="Enter quantity to take"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remaining Quantity After Taking <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={remainingQuantity}
                  onChange={handleRemainingQuantityChange}
                  onBlur={validateStockMath}
                  placeholder="Enter remaining quantity"
                  required
                />
                {selectedItem && quantityTaking && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Expected: {selectedItem.currentStock || 0} - {parseFloat(quantityTaking) || 0} ={' '}
                    {((selectedItem.currentStock || 0) - (parseFloat(quantityTaking) || 0)).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Current Truck Inventory Display */}
          {selectedItem && truckInventory && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  Current Truck Inventory
                </span>
                {loadingTruckInventory && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">Loading...</span>
                )}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                {truckInventory.currentTruckInventory} units
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Total Checked Out: {truckInventory.totalCheckedOut}</div>
                <div>Total Sold: {truckInventory.totalSold}</div>
                {truckInventory.discrepancyAdjustment !== 0 && (
                  <div className="text-blue-600 dark:text-blue-400">
                    Discrepancy Adjustments: {truckInventory.discrepancyAdjustment > 0 ? '+' : ''}
                    {truckInventory.discrepancyAdjustment}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actual Truck Inventory Input */}
          {selectedItem && truckInventory && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Actual Quantity on Truck (Physical Count)
              </label>
              <Input
                type="number"
                step="0.01"
                value={actualTruckInventory}
                onChange={(e) => setActualTruckInventory(e.target.value)}
                placeholder="How many do you actually have on truck?"
              />
              {quantityTaking && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Expected after checkout: {truckInventory.currentTruckInventory} + {parseFloat(quantityTaking) || 0} ={' '}
                  {truckInventory.currentTruckInventory + (parseFloat(quantityTaking) || 0)}
                </p>
              )}
            </div>
          )}

          {validationError && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">{validationError}</p>
            </div>
          )}
        </Card>
        {}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Notes
          </h2>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes about this checkout"
            rows={4}
          />
        </Card>
        {}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/truck-checkouts')}
            disabled={loading || submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading || submitting}
            disabled={loading || submitting}
          >
            Create Checkout
          </Button>
        </div>
      </form>
      {}
      <Modal
        isOpen={showItemPicker}
        onClose={() => setShowItemPicker(false)}
        title="Select Item"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {searching && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading items...
              </div>
            )}
            {!searching && searchResults.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery ? `No items found matching "${searchQuery}"` : 'No RouteStarItems available'}
              </div>
            )}
            {!searching && searchResults.map((item, index) => (
              <button
                key={`${item.itemName}-${index}`}
                type="button"
                onClick={() => handleItemSelect(item)}
                className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.itemName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {item.currentStock || 0} • Purchased: {item.totalPurchased || 0} • Sold:{' '}
                    {item.totalSold || 0} • Checked Out: {item.totalCheckedOut || 0} • Discrepancies:{' '}
                    {item.totalDiscrepancies || 0}
                  </div>
                </div>
                {selectedItem?.itemName === item.itemName && (
                  <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>
      {}
      <Modal
        isOpen={showDiscrepancyModal}
        onClose={() => !submitting && setShowDiscrepancyModal(false)}
        title="Discrepancy Detected"
        size="lg"
      >
        <div className="space-y-4">
          {discrepancyInfo && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Stock Remaining Discrepancy
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Stock:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{discrepancyInfo.currentStock}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taking:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{discrepancyInfo.taking}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expected Remaining:</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{discrepancyInfo.expectedRemaining}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">You Entered:</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{discrepancyInfo.userEnteredRemaining}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Difference:</span>
                  <span className={`text-sm font-bold ${parseFloat(discrepancyInfo.difference) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(discrepancyInfo.difference) > 0 ? '+' : ''}{discrepancyInfo.difference} ({discrepancyInfo.discrepancyType})
                  </span>
                </div>
              </div>
            </div>
          )}

          {truckDiscrepancyInfo && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Truck Inventory Discrepancy
                </h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Truck Inventory:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{truckDiscrepancyInfo.currentTruckInventory}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Adding to Truck:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{truckDiscrepancyInfo.quantityTaking}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expected Truck Inventory:</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{truckDiscrepancyInfo.expectedTruckInventory}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">You Entered:</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{truckDiscrepancyInfo.actualTruckInventory}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Difference:</span>
                  <span className={`text-sm font-bold ${truckDiscrepancyInfo.truckDiscrepancyDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {truckDiscrepancyInfo.truckDiscrepancyDifference > 0 ? '+' : ''}{truckDiscrepancyInfo.truckDiscrepancyDifference} ({truckDiscrepancyInfo.truckDiscrepancyType})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Accepting will create approved discrepancy record(s) and adjust accordingly.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setShowDiscrepancyModal(false); setDiscrepancyInfo(null); setTruckDiscrepancyInfo(null); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={submitting}
              disabled={submitting}
              onClick={() => submitCheckout(!!discrepancyInfo, !!truckDiscrepancyInfo)}
            >
              Accept & Create Checkout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default TruckCheckoutForm;
