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
  RefreshCw, Grid, List, Save, Trash, ChevronDown, ChevronUp
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

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-product.png';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendUrl}${imagePath}`;
    }
    return imagePath || '/placeholder-product.png';
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
        inventoryService.getAll({ limit: 1000 }),
        settingsService.getCategories(),
      ]);

      const productsData = productsRes?.data?.items || [];
      const categoriesData = categoriesRes?.data?.categories || [];

      
      const availableProducts = productsData.filter(p => p.currentStock > 0);

      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
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

  
  const addToCart = useCallback((product) => {
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        showError(`Only ${product.currentStock} units available in stock`);
        return;
      }
      setCart(
        cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
      showSuccess(`Added ${product.itemName} to cart`);
    } else {
      setCart([
        ...cart,
        {
          _id: product._id,
          itemName: product.itemName,
          skuCode: product.skuCode,
          sellingPrice: product.sellingPrice,
          currentStock: product.currentStock,
          image: product.image,
          quantity: 1,
        },
      ]);
      showSuccess(`${product.itemName} added to cart`);
    }
  }, [cart, showError, showSuccess]);

  
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
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-2'
              }`}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    viewMode === 'grid' ? (
                      <div
                        key={product._id}
                        className="group relative border-2 border-slate-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-850 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-[1.02] overflow-hidden"
                        onClick={() => addToCart(product)}
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl pointer-events-none"></div>
                        <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 rounded-xl mb-3 overflow-hidden shadow-inner">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.itemName}
                            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                            onError={(e) => {
                              // Prevent infinite loop - only set placeholder once
                              if (e.target.src !== e.target.baseURI + 'placeholder-product.png') {
                                e.target.onerror = null; // Remove error handler to prevent loop
                                e.target.src = '/placeholder-product.png';
                              }
                            }}
                          />
                          {/* Image overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Badge
                            variant={product.currentStock <= product.lowStockThreshold ? 'warning' : 'success'}
                            className="absolute top-2 right-2 shadow-lg backdrop-blur-sm bg-opacity-90 font-semibold animate-pulse"
                          >
                            {product.currentStock} left
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 truncate relative z-10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {product.itemName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-3 font-medium">
                          SKU: {product.skuCode}
                        </p>
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                            ${product.sellingPrice?.toFixed(2)}
                          </span>
                          <Button size="sm" className="gap-1 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            <Plus className="w-4 h-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={product._id}
                        className="group relative flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-[1.01] overflow-hidden"
                        onClick={() => addToCart(product)}
                      >
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                        <div className="relative">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.itemName}
                            className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-slate-200 dark:ring-gray-600 group-hover:ring-blue-400"
                            onError={(e) => {
                              // Prevent infinite loop - only set placeholder once
                              if (e.target.src !== e.target.baseURI + 'placeholder-product.png') {
                                e.target.onerror = null; // Remove error handler to prevent loop
                                e.target.src = '/placeholder-product.png';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 relative z-10">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{product.itemName}</h3>
                          <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">SKU: {product.skuCode}</p>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">${product.sellingPrice?.toFixed(2)}</p>
                          <Badge variant={product.currentStock <= product.lowStockThreshold ? 'warning' : 'success'} size="sm" className="mt-1 shadow-sm">
                            {product.currentStock} in stock
                          </Badge>
                        </div>
                        <Button size="sm" className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 relative z-10">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  ))
                ) : (
                  <div className="col-span-full text-center py-24 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-600 shadow-inner">
                    <div className="relative inline-block">
                      <Package className="w-20 h-20 text-slate-400 dark:text-gray-500 mx-auto mb-4 animate-bounce" />
                      <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 animate-pulse"></div>
                    </div>
                    <p className="text-xl font-bold text-slate-700 dark:text-gray-300 mb-2">No products found</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Try adjusting your filters or search terms</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
              <div className="space-y-3 mb-4 max-h-[350px] overflow-y-auto">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div
                      key={item._id}
                      className="relative flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-750 rounded-xl border-2 border-slate-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg group overflow-hidden"
                    >
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                      <div className="relative">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.itemName}
                          className="w-16 h-16 object-cover rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 ring-2 ring-slate-200 dark:ring-gray-600"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-gray-400 font-medium">${item.sellingPrice?.toFixed(2)} each</p>
                        <p className="text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                          Total: ${(item.sellingPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 relative z-10">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all hover:shadow-md hover:scale-110 duration-200"
                        >
                          <Minus className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                          className="w-14 text-center font-bold bg-white dark:bg-gray-600 rounded-lg px-2 py-1.5 border-2 border-slate-300 dark:border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                        />
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all hover:shadow-md hover:scale-110 duration-200"
                        >
                          <Plus className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all ml-1 hover:shadow-md hover:scale-110 duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-600 shadow-inner">
                    <div className="relative inline-block">
                      <ShoppingCart className="w-16 h-16 text-slate-400 dark:text-blue-500 mx-auto mb-3 animate-bounce" />
                      <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 animate-pulse"></div>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-sm font-bold">Cart is empty</p>
                    <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">Add products to get started</p>
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <>
                  <div className="border-t border-slate-200 dark:border-gray-700 pt-4 space-y-2 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-750 p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-gray-400 font-semibold">Subtotal</span>
                      <span className="font-bold text-slate-900 dark:text-white text-base">${calculateSubtotal.toFixed(2)}</span>
                    </div>
                    {discount.value > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 font-semibold">
                          <Percent className="w-3 h-3" />
                          Discount
                        </span>
                        <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent text-base">
                          -${calculateDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t-2 border-slate-200 dark:border-gray-600 pt-3 mt-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-750 dark:to-gray-700 -mx-5 px-5 py-3 rounded-b-xl">
                      <span className="text-slate-900 dark:text-white">Total</span>
                      <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        ${calculateTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} className="w-full mt-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 text-white" size="lg">
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
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
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
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
      </div>
    </div>
  );
};

export default PointOfSale;
