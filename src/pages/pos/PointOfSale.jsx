import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService from '../../services/inventoryService';
import settingsService from '../../services/settingsService';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ShoppingCart, Plus, Minus, Trash2, User, DollarSign, Package,
  Search, Filter, X, CreditCard, Percent, Tag, Receipt,
  RefreshCw, Grid, List, Save, Trash, ChevronDown, ChevronUp,
  CheckSquare, Square, Calendar, Layers
} from 'lucide-react';

const PointOfSale = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useContext(ToastContext);
  const { user } = useAuth();

  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 

  
  const [cart, setCart] = useState([]);
  const [savedCarts, setSavedCarts] = useState([]);
  const [showSavedCarts, setShowSavedCarts] = useState(false);

  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');


  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Purchase Selection Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productPurchases, setProductPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchaseAllocations, setPurchaseAllocations] = useState({});
  const [customPrice, setCustomPrice] = useState(0);


  const getImageUrl = (imagePath) => {
    if (!imagePath) return null; // Return null if no image
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5001';
      return `${backendUrl}${imagePath}`;
    }
    return imagePath;
  };

  
  useEffect(() => {
    const saved = localStorage.getItem('savedCarts');
    if (saved) {
      setSavedCarts(JSON.parse(saved));
    }
  }, []);

  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        inventoryService.getAll({ limit: 1000, usePOSPricing: true }),
        settingsService.getCategories(),
      ]);

      const productsData = productsRes?.data?.items || [];
      const categoriesData = categoriesRes?.data?.categories || [];

      // Show all products (don't filter by stock)
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.skuCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Fetch purchases for a product
  const fetchProductPurchases = async (productId) => {
    setLoadingPurchases(true);
    try {
      const response = await api.get(`/inventory/${productId}/purchases`);
      const purchases = response.data?.data?.purchases || response.data?.purchases || [];

      // Filter only purchases with remaining quantity
      const availablePurchases = purchases.filter(p => (p.remainingQuantity ?? p.quantity) > 0);

      setProductPurchases(availablePurchases);

      // Initialize allocations
      const initialAllocations = {};
      availablePurchases.forEach(purchase => {
        initialAllocations[purchase._id] = {
          selected: false,
          quantity: 0,
          maxQuantity: purchase.remainingQuantity ?? purchase.quantity
        };
      });
      setPurchaseAllocations(initialAllocations);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      showError('Failed to load purchase history');
      setProductPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Open purchase selection modal
  const openPurchaseModal = async (product) => {
    setSelectedProduct(product);
    setCustomPrice(product.sellingPrice || 0);
    setShowPurchaseModal(true);
    await fetchProductPurchases(product._id);
  };

  // Close purchase selection modal
  const closePurchaseModal = () => {
    if (!loadingPurchases) {
      setShowPurchaseModal(false);
      setSelectedProduct(null);
      setProductPurchases([]);
      setPurchaseAllocations({});
      setCustomPrice(0);
    }
  };

  // Handle purchase selection toggle
  const togglePurchaseSelection = (purchaseId) => {
    setPurchaseAllocations(prev => ({
      ...prev,
      [purchaseId]: {
        ...prev[purchaseId],
        selected: !prev[purchaseId].selected,
        quantity: !prev[purchaseId].selected ? Math.min(1, prev[purchaseId].maxQuantity) : 0
      }
    }));
  };

  // Handle allocation quantity change
  const updateAllocationQuantity = (purchaseId, quantity) => {
    const allocation = purchaseAllocations[purchaseId];
    const validQuantity = Math.max(0, Math.min(quantity, allocation.maxQuantity));

    setPurchaseAllocations(prev => ({
      ...prev,
      [purchaseId]: {
        ...prev[purchaseId],
        quantity: validQuantity,
        selected: validQuantity > 0
      }
    }));
  };

  // Calculate total quantity from allocations
  const getTotalAllocatedQuantity = () => {
    return Object.values(purchaseAllocations).reduce((sum, alloc) => sum + (alloc.selected ? alloc.quantity : 0), 0);
  };

  // Add to cart with purchase allocations
  const addToCartWithAllocations = () => {
    const totalQty = getTotalAllocatedQuantity();

    if (totalQty === 0) {
      showError('Please select at least one purchase and specify quantity');
      return;
    }

    // Get selected allocations
    const selectedAllocations = Object.entries(purchaseAllocations)
      .filter(([_, alloc]) => alloc.selected && alloc.quantity > 0)
      .map(([purchaseId, alloc]) => {
        const purchase = productPurchases.find(p => p._id === purchaseId);
        return {
          purchaseId,
          quantity: alloc.quantity,
          purchaseDate: purchase.purchaseDate || purchase.date,
          supplier: purchase.supplier?.name || purchase.supplier
        };
      });

    // Check if item already in cart
    const existingItem = cart.find((item) => item._id === selectedProduct._id);

    if (existingItem) {
      // Merge allocations
      const mergedAllocations = [...(existingItem.purchaseAllocations || [])];

      selectedAllocations.forEach(newAlloc => {
        const existing = mergedAllocations.find(a => a.purchaseId === newAlloc.purchaseId);
        if (existing) {
          existing.quantity += newAlloc.quantity;
        } else {
          mergedAllocations.push(newAlloc);
        }
      });

      const newTotalQty = mergedAllocations.reduce((sum, a) => sum + a.quantity, 0);

      if (newTotalQty > selectedProduct.currentStock) {
        showError(`Only ${selectedProduct.currentStock} units available in stock`);
        return;
      }

      setCart(cart.map((item) =>
        item._id === selectedProduct._id
          ? { ...item, quantity: newTotalQty, sellingPrice: customPrice, purchaseAllocations: mergedAllocations }
          : item
      ));
      showSuccess(`Updated ${selectedProduct.itemName} in cart`);
    } else {
      setCart([
        ...cart,
        {
          _id: selectedProduct._id,
          itemName: selectedProduct.itemName,
          skuCode: selectedProduct.skuCode,
          sellingPrice: customPrice,
          currentStock: selectedProduct.currentStock,
          image: selectedProduct.image,
          quantity: totalQty,
          purchaseAllocations: selectedAllocations,
        },
      ]);
      showSuccess(`${selectedProduct.itemName} added to cart`);
    }

    // Close modal and reset
    setShowPurchaseModal(false);
    setSelectedProduct(null);
    setProductPurchases([]);
    setPurchaseAllocations({});
    setCustomPrice(0);
  };


  const addToCart = useCallback((product) => {
    // Open purchase selection modal instead of directly adding
    openPurchaseModal(product);
  }, []);

  
  const updateQuantity = useCallback((productId, newQuantity) => {
    const product = products.find((p) => p._id === productId);

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > product.currentStock) {
      showError(`Only ${product.currentStock} units available in stock`);
      return;
    }

    setCart(cart.map((item) => (item._id === productId ? { ...item, quantity: newQuantity } : item)));
  }, [products, cart, showError]);

  
  const removeFromCart = useCallback((productId) => {
    const item = cart.find(i => i._id === productId);
    setCart(cart.filter((item) => item._id !== productId));
    if (item) {
      showInfo(`${item.itemName} removed from cart`);
    }
  }, [cart, showInfo]);

  
  const clearCart = () => {
    setCart([]);
    setCustomerDetails({ name: '', email: '', phone: '', address: '' });
    setDiscount({ type: 'percentage', value: 0 });
    setCouponCode('');
    setAppliedCoupon(null);
    setNotes('');
    showInfo('Cart cleared');
  };

  
  const saveCart = () => {
    if (cart.length === 0) {
      showError('Cart is empty');
      return;
    }

    const cartName = prompt('Enter a name for this cart:');
    if (!cartName) return;

    const savedCart = {
      id: Date.now(),
      name: cartName,
      items: cart,
      customer: customerDetails,
      discount,
      notes,
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedCarts, savedCart];
    setSavedCarts(updated);
    localStorage.setItem('savedCarts', JSON.stringify(updated));
    showSuccess(`Cart saved as "${cartName}"`);
  };

  
  const loadCart = (savedCart) => {
    setCart(savedCart.items);
    setCustomerDetails(savedCart.customer);
    setDiscount(savedCart.discount);
    setNotes(savedCart.notes);
    setShowSavedCarts(false);
    showSuccess(`Cart "${savedCart.name}" loaded`);
  };

  
  const deleteSavedCart = (cartId) => {
    const updated = savedCarts.filter(c => c.id !== cartId);
    setSavedCarts(updated);
    localStorage.setItem('savedCarts', JSON.stringify(updated));
    showInfo('Saved cart deleted');
  };

  
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

      const response = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        subtotal,
      });

      if (response.data.valid) {
        const coupon = response.data.coupon;
        setAppliedCoupon(coupon);

        
        setDiscount({
          type: 'fixed',
          value: coupon.discountAmount,
        });

        showSuccess(`Coupon "${coupon.code}" applied! You save $${coupon.discountAmount.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showError(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscount({ type: 'percentage', value: 0 });
    showInfo('Coupon removed');
  };

  
  const calculateSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const calculateDiscount = useMemo(() => {
    const subtotal = calculateSubtotal;
    if (discount.type === 'fixed') {
      return Math.min(discount.value, subtotal);
    } else {
      return (subtotal * discount.value) / 100;
    }
  }, [calculateSubtotal, discount]);

  const calculateTotal = useMemo(() => {
    const subtotal = calculateSubtotal;
    const discountAmount = calculateDiscount;
    return subtotal - discountAmount;
  }, [calculateSubtotal, calculateDiscount]);

  
  const handleCheckout = () => {
    if (cart.length === 0) {
      showError('Cart is empty');
      return;
    }
    setShowCheckoutModal(true);
  };

  
  const processSale = async () => {
    if (!customerDetails.name || !customerDetails.email) {
      showError('Customer name and email are required');
      return;
    }

    setProcessingCheckout(true);

    try {
      const subtotal = calculateSubtotal;
      const discountAmount = calculateDiscount;
      const total = calculateTotal;

      const invoiceData = {
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
        },
        items: cart.map((item) => ({
          inventory: item._id,
          itemName: item.itemName,
          description: item.itemName,
          skuCode: item.skuCode,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          taxRate: 0,
          discount: 0,
          purchaseAllocations: item.purchaseAllocations || [], // Include which purchases to deduct from
        })),
        amounts: {
          subtotal: subtotal,
          tax: 0,
          discount: discountAmount,
          total: total,
        },
        discount: {
          type: discount.type,
          value: discount.value,
          amount: discountAmount,
        },
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount,
        } : null,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await api.post('/invoices', invoiceData);

      
      if (appliedCoupon) {
        try {
          await api.post(`/coupons/${appliedCoupon._id}/use`);
        } catch (error) {
          console.error('Error updating coupon usage:', error);
          
        }
      }

      showSuccess(`Sale submitted for approval! Invoice #${response.data.invoice.invoiceNumber} is pending`);

      
      clearCart();
      setShowCheckoutModal(false);

      
      fetchData();

      
      navigate(`/invoices/${response.data.invoice._id}`);
    } catch (error) {
      console.error('Error processing sale:', error);
      showError(error.response?.data?.error?.message || error.message || 'Failed to process sale');
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 lg:px-8 py-8 max-w-[1800px]">
        {}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <ShoppingCart className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                Point of Sale
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-gray-400 mt-1 md:mt-2 ml-1">
                Cashier: <span className="font-semibold text-slate-900 dark:text-white">{user?.fullName || user?.username}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedCarts(true)}
                className="gap-1 md:gap-2 flex-1 sm:flex-none text-xs md:text-sm"
              >
                <Save className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Saved</span> ({savedCarts.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                className="gap-1 md:gap-2 flex-1 sm:flex-none text-xs md:text-sm"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-7">
            <Card padding="lg" className="h-full shadow-sm border border-slate-200 dark:border-gray-700">
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Search by name or SKU..."
                      fullWidth
                    />
                  </div>
                  <div className="sm:w-64">
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border-2 border-slate-200 dark:border-gray-600 hover:border-blue-400'}`}
                      title="Grid View"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 border-2 border-slate-200 dark:border-gray-600 hover:border-blue-400'}`}
                      title="List View"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Active filters */}
                {(searchTerm || selectedCategory) && (
                  <div className="flex items-center gap-3 flex-wrap bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl border-2 border-blue-200 dark:border-gray-700 shadow-sm">
                    <span className="text-sm font-bold text-slate-700 dark:text-gray-300 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      Active Filters:
                    </span>
                    {searchTerm && (
                      <Badge variant="info" className="gap-2 px-3 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <Search className="w-3.5 h-3.5" />
                        Search: {searchTerm}
                        <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-1 transition-all hover:scale-110">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="info" className="gap-2 px-3 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <Filter className="w-3.5 h-3.5" />
                        {categories.find((c) => c.value === selectedCategory)?.label}
                        <button onClick={() => setSelectedCategory('')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-1 transition-all hover:scale-110">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )}
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline hover:scale-105 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Products Grid/List */}
              <div className={`max-h-[600px] overflow-y-auto ${
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
                  : 'space-y-2'
              }`}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    viewMode === 'grid' ? (
                      <div
                        key={product._id}
                        className="group relative border border-slate-200 rounded-lg p-2.5 hover:border-blue-400 transition-all duration-200 cursor-pointer bg-white hover:shadow-md"
                        onClick={() => addToCart(product)}
                      >
                        <div className="relative h-32 bg-slate-100 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                          {getImageUrl(product.image) ? (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.itemName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${getImageUrl(product.image) ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-slate-100`}>
                            <Package className="w-12 h-12 text-slate-400" />
                          </div>
                          <Badge
                            variant={product.currentStock <= product.lowStockThreshold ? 'warning' : 'success'}
                            className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5"
                          >
                            {product.currentStock}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-xs text-slate-900 mb-1 truncate group-hover:text-blue-600 transition-colors leading-tight">
                          {product.itemName}
                        </h3>
                        <p className="text-xs text-slate-500 mb-1.5 truncate">
                          {product.skuCode}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-slate-500" />
                            <span className={`text-sm font-bold ${product.currentStock > 0 ? 'text-slate-700' : 'text-red-600'}`}>
                              {product.currentStock} {product.unit || 'units'}
                            </span>
                          </div>
                          <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors">
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={product._id}
                        className="group relative flex items-center gap-3 p-3 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800"
                        onClick={() => addToCart(product)}
                      >
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.itemName}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-gray-600 group-hover:border-blue-400 transition-all"
                          onError={(e) => {
                            if (e.target.src !== e.target.baseURI + 'placeholder-product.png') {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-product.png';
                            }
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {product.itemName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-gray-400">SKU: {product.skuCode}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <Package className="w-4 h-4 text-slate-500" />
                            <span className={`text-base font-bold ${product.currentStock > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-red-600'}`}>
                              {product.currentStock}
                            </span>
                          </div>
                          <Badge variant={product.currentStock <= product.lowStockThreshold ? 'warning' : 'success'} size="sm">
                            {product.unit || 'units'}
                          </Badge>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-600">
                    <Package className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-2">No products found</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Try adjusting your filters or search terms</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-3">
            <Card padding="lg" className="sticky top-4 shadow-sm border border-slate-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Cart ({cart.length})
                </h2>
                {cart.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={saveCart}
                      className="text-sm text-blue-600 hover:text-blue-700"
                      title="Save cart"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700"
                      title="Clear cart"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-2 mb-4 max-h-[350px] overflow-y-auto">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div
                      key={item._id}
                      className="relative flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 group"
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.itemName}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-gray-600"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-gray-400">${item.sellingPrice?.toFixed(2)} each</p>
                        {item.purchaseAllocations && item.purchaseAllocations.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.purchaseAllocations.map((alloc, idx) => (
                              <div key={idx} className="text-xs text-slate-500 flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                <span>{alloc.quantity} from {new Date(alloc.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          ${(item.sellingPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-all"
                        >
                          <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-gray-300" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-sm font-semibold bg-white dark:bg-gray-600 rounded px-1.5 py-1 border border-slate-300 dark:border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                        />
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded transition-all ml-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-gray-600">
                    <ShoppingCart className="w-12 h-12 text-slate-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-gray-300 text-sm font-semibold">Cart is empty</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">Add products to get started</p>
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <>
                  <div className="border-t border-slate-200 dark:border-gray-700 pt-3 space-y-2 bg-slate-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-gray-400 font-medium">Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">${calculateSubtotal.toFixed(2)}</span>
                    </div>
                    {discount.value > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 font-medium">
                          <Percent className="w-3 h-3" />
                          Discount
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          -${calculateDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 dark:border-gray-600 pt-2 mt-2">
                      <span className="text-slate-900 dark:text-white">Total</span>
                      <span className="text-xl text-blue-600 dark:text-blue-400">
                        ${calculateTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} className="w-full mt-3 bg-blue-600 hover:bg-blue-700" size="lg">
                    <Receipt className="w-5 h-5 mr-2" />
                    Checkout
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Checkout Modal */}
        <Modal
          isOpen={showCheckoutModal}
          onClose={() => !processingCheckout && setShowCheckoutModal(false)}
          title="Complete Sale"
          size="lg"
        >
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-slate-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name *"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                />
                <Input
                  label="Phone"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) =>
                    setCustomerDetails({ ...customerDetails, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State, ZIP"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
            </div>

            {/* Coupon & Discount */}
            <div className="bg-slate-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Tag className="w-5 h-5 text-blue-600" />
                Coupon & Discount (Optional)
              </h3>

              {/* Coupon Code Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apply Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Saves ${appliedCoupon.discountAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                      onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      loading={validatingCoupon}
                      className="whitespace-nowrap"
                    >
                      {validatingCoupon ? 'Checking...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Manual Discount Section */}
              {!appliedCoupon && (
                <>
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        OR manual discount
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type"
                      value={discount.type}
                      onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </Select>
                    <Input
                      label="Value"
                      type="number"
                      min="0"
                      value={discount.value}
                      onChange={(e) =>
                        setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-slate-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Method
              </h3>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-750 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white text-base">${calculateSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-750 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Discount</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    -${calculateDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-blue-600 mt-4">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${calculateTotal.toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-750 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    ⓘ This sale will be submitted for admin approval
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowCheckoutModal(false)}
                disabled={processingCheckout}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={processSale}
                disabled={processingCheckout}
                loading={processingCheckout}
                className="flex-1"
              >
                {processingCheckout ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Saved Carts Modal */}
        <Modal
          isOpen={showSavedCarts}
          onClose={() => setShowSavedCarts(false)}
          title="Saved Carts"
          size="md"
        >
          <div className="space-y-3">
            {savedCarts.length > 0 ? (
              savedCarts.map((savedCart) => (
                <div
                  key={savedCart.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {savedCart.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {savedCart.items.length} items • {new Date(savedCart.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => loadCart(savedCart)}
                    >
                      Load
                    </Button>
                    <button
                      onClick={() => deleteSavedCart(savedCart.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Save className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No saved carts</p>
              </div>
            )}
          </div>
        </Modal>

        {/* Purchase Selection Modal */}
        <Modal
          isOpen={showPurchaseModal}
          onClose={closePurchaseModal}
          title="Select Purchase Batches"
          size="lg"
        >
          {selectedProduct && (
            <div className="space-y-4">
              {/* Compact Product Header */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <img
                  src={getImageUrl(selectedProduct.image)}
                  alt={selectedProduct.itemName}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-900 truncate">{selectedProduct.itemName}</h3>
                  <p className="text-xs text-slate-600">SKU: {selectedProduct.skuCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Selected</p>
                  <p className="text-2xl font-bold text-blue-600">{getTotalAllocatedQuantity()}</p>
                </div>
              </div>

              {/* Loading State */}
              {loadingPurchases ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <LoadingSpinner size="md" />
                  <p className="text-sm text-slate-600 mt-3">Loading purchases...</p>
                </div>
              ) : productPurchases.length > 0 ? (
                <>
                  {/* Compact Instructions */}
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-700">Check boxes to select purchase batches, then enter quantity. Mix multiple batches for FIFO management.</p>
                  </div>

                  {/* Compact Purchase List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {productPurchases.map((purchase, index) => {
                      const allocation = purchaseAllocations[purchase._id] || {};
                      const formatDate = (date) => {
                        if (!date) return 'N/A';
                        return new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        });
                      };

                      return (
                        <div
                          key={purchase._id}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            allocation.selected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => togglePurchaseSelection(purchase._id)}
                              className="flex-shrink-0"
                            >
                              {allocation.selected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400" />
                              )}
                            </button>

                            {/* Purchase Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs text-slate-500">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {formatDate(purchase.purchaseDate || purchase.date)}
                                </span>
                                <span className="text-xs font-bold text-green-600">
                                  ${purchase.sellingPrice?.toFixed(2) || '0.00'}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-slate-500">Supplier:</span>
                                  <span className="font-semibold text-slate-900 ml-1">
                                    {purchase.supplier?.name || purchase.supplier || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Purchased:</span>
                                  <span className="font-semibold text-slate-900 ml-1">
                                    {purchase.quantity} {purchase.unit}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Available:</span>
                                  <span className={`font-semibold ml-1 ${(purchase.remainingQuantity ?? purchase.quantity) > 5 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {purchase.remainingQuantity ?? purchase.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 p-1">
                                <button
                                  onClick={() => updateAllocationQuantity(purchase._id, allocation.quantity - 1)}
                                  disabled={!allocation.selected || allocation.quantity <= 0}
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                >
                                  <Minus className="w-3 h-3 text-slate-600" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  max={allocation.maxQuantity}
                                  value={allocation.quantity || ''}
                                  onChange={(e) => updateAllocationQuantity(purchase._id, parseInt(e.target.value) || 0)}
                                  disabled={!allocation.selected}
                                  className="w-14 text-center text-sm font-bold bg-white border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded disabled:text-slate-400"
                                  placeholder="0"
                                />
                                <button
                                  onClick={() => updateAllocationQuantity(purchase._id, allocation.quantity + 1)}
                                  disabled={!allocation.selected || allocation.quantity >= allocation.maxQuantity}
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                >
                                  <Plus className="w-3 h-3 text-slate-600" />
                                </button>
                              </div>
                              <p className="text-xs text-center text-slate-500 mt-0.5">
                                Max: {allocation.maxQuantity}
                              </p>
                            </div>
                          </div>

                          {/* Quick Select Buttons - More Compact */}
                          {allocation.selected && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                              <span className="text-xs text-slate-600 font-medium">Quick:</span>
                              <button
                                onClick={() => updateAllocationQuantity(purchase._id, Math.min(1, allocation.maxQuantity))}
                                className="text-xs px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-medium"
                              >
                                1
                              </button>
                              <button
                                onClick={() => updateAllocationQuantity(purchase._id, Math.min(5, allocation.maxQuantity))}
                                className="text-xs px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-medium"
                              >
                                5
                              </button>
                              <button
                                onClick={() => updateAllocationQuantity(purchase._id, Math.min(10, allocation.maxQuantity))}
                                className="text-xs px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-medium"
                              >
                                10
                              </button>
                              <button
                                onClick={() => updateAllocationQuantity(purchase._id, allocation.maxQuantity)}
                                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                              >
                                All ({allocation.maxQuantity})
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact Footer */}
                  <div className="space-y-3">
                    {/* Price Input */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-blue-200">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-600 font-medium mb-1">Selling Price (per unit)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="text-right pt-5">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${(customPrice * getTotalAllocatedQuantity()).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500">Total Quantity</p>
                        <p className="text-xl font-bold text-slate-700">{getTotalAllocatedQuantity()} units</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={closePurchaseModal}
                          className="px-4"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addToCartWithAllocations}
                          disabled={getTotalAllocatedQuantity() === 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-semibold">No Purchase History</p>
                  <p className="text-sm text-slate-500">This item has no available stock from purchases</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PointOfSale;
