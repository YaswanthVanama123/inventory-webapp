import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import stockService from '../../services/stockService';
import discrepancyService from '../../services/discrepancyService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArchiveBoxIcon, ShoppingCartIcon, ShoppingBagIcon, ArrowPathIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentTextIcon, TruckIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Package, CheckCircle2 } from 'lucide-react';

const Stock = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('use'); 
  const [useStockData, setUseStockData] = useState({ items: [], totals: {} });
  const [sellStockData, setSellStockData] = useState({ items: [], totals: {} });
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSKUs, setExpandedSKUs] = useState(new Set());
  const [categorySkuData, setCategorySkuData] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(new Set());
  const [showDiscrepancyModal, setShowDiscrepancyModal] = useState(false);
  const [prefilledItem, setPrefilledItem] = useState(null);
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  const loadData = async (showToast = false) => {
    try {
      setLoading(true);
      const response = await stockService.getStockSummary();
      setUseStockData(response.useStock || { items: [], totals: {} });
      setSellStockData(response.sellStock || { items: [], totals: {} });
      if (showToast) {
        showSuccess('Stock data refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
      showError('Failed to load stock data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryClick = async (categoryName) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
      setExpandedCategories(newExpanded);
    } else {
      newExpanded.add(categoryName);
      setExpandedCategories(newExpanded);
      if (!categorySkuData[categoryName]) {
        try {
          const newLoadingCategories = new Set(loadingCategories);
          newLoadingCategories.add(categoryName);
          setLoadingCategories(newLoadingCategories);
          const response = activeTab === 'use'
            ? await stockService.getCategorySKUs(categoryName)
            : await stockService.getCategorySales(categoryName);
          setCategorySkuData(prev => ({
            ...prev,
            [categoryName]: response.skus || []
          }));
          newLoadingCategories.delete(categoryName);
          setLoadingCategories(newLoadingCategories);
        } catch (error) {
          console.error('Error loading category data:', error);
          showError(`Failed to load category data: ${error.message}`);
          const newLoadingCategories = new Set(loadingCategories);
          newLoadingCategories.delete(categoryName);
          setLoadingCategories(newLoadingCategories);
        }
      }
    }
  };
  const handleSKUClick = (skuId) => {
    const newExpanded = new Set(expandedSKUs);
    if (newExpanded.has(skuId)) {
      newExpanded.delete(skuId);
    } else {
      newExpanded.add(skuId);
    }
    setExpandedSKUs(newExpanded);
  };
  const currentData = activeTab === 'use' ? useStockData : sellStockData;
  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View stock summary by category for purchases and sales
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => loadData(true)}
          size="sm"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      {}
      <Card>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('use');
              setExpandedCategories(new Set());
              setExpandedSKUs(new Set());
              setCategorySkuData({});
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'use'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Use Stock (Purchases)
          </button>
          <button
            onClick={() => {
              setActiveTab('sell');
              setExpandedCategories(new Set());
              setExpandedSKUs(new Set());
              setCategorySkuData({});
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sell'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Sell Stock (Sales)
          </button>
        </div>
      </Card>
      {}
      <div className={`grid grid-cols-1 ${activeTab === 'sell' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {activeTab === 'use' ? (
          <>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{currentData.totals.categoryCount || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FolderIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Distinct categories
                </p>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Quantity</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">{currentData.totals.totalQuantity || 0}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Units purchased
                </p>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">${(currentData.totals.totalValue || 0).toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Purchase value
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Purchased</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{currentData.totals.totalPurchased || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCartIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Units ordered
                </p>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Sold</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{currentData.totals.totalSold || 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Units sold
                </p>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Checked Out</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">{currentData.totals.totalCheckedOut || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Units on trucks
                </p>
              </div>
            </div>
            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Stock Remaining</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{currentData.totals.stockRemaining || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <ArchiveBoxIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Available stock
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      {}
      <Card>
        {currentData.items.length === 0 ? (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No {activeTab === 'use' ? 'purchase' : 'sales'} data available
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {activeTab === 'use'
                ? 'Orders with mapped categories will appear here'
                : 'Invoices with mapped categories will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category Name
                  </th>
                  {activeTab === 'use' ? (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Quantity
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item Count
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Value
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Purchased
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sold
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Checked Out
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock Remaining
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discrepancies
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Orders / Invoices
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Value
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {currentData.items.map((item, index) => (
                  <React.Fragment key={item.categoryName}>
                    {}
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleCategoryClick(item.categoryName)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedCategories.has(item.categoryName) ? (
                            <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <FolderIcon className={`w-5 h-5 mr-3 ${activeTab === 'use' ? 'text-blue-500' : 'text-green-500'}`} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.categoryName}
                          </span>
                        </div>
                      </td>
                      {activeTab === 'use' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.totalQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {item.itemCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              ${item.totalValue.toFixed(2)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {item.totalPurchased || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {item.totalSold || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {item.totalCheckedOut || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {item.stockRemaining || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-red-600 dark:text-red-400">
                              {item.totalDiscrepancyDifference !== undefined ? item.totalDiscrepancyDifference : item.totalDiscrepancies || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {item.itemCount || 0} / {item.invoiceCount || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              ${(item.totalPurchaseValue || 0).toFixed(2)}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                    {}
                    {expandedCategories.has(item.categoryName) && (
                      <>
                        {loadingCategories.has(item.categoryName) ? (
                          <tr>
                            <td colSpan={activeTab === 'use' ? '4' : '8'} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                Loading SKUs...
                              </div>
                            </td>
                          </tr>
                        ) : categorySkuData[item.categoryName] && categorySkuData[item.categoryName].length > 0 ? (
                          categorySkuData[item.categoryName].map((sku) => (
                            <React.Fragment key={sku.sku}>
                              <tr
                                className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => handleSKUClick(sku.sku)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center pl-8">
                                    {expandedSKUs.has(sku.sku) ? (
                                      <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    ) : (
                                      <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                                    )}
                                    <DocumentTextIcon className={`w-4 h-4 mr-2 ${activeTab === 'use' ? 'text-blue-400' : 'text-green-400'}`} />
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {sku.sku}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {sku.itemName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                {activeTab === 'use' ? (
                                  <>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {sku.totalQuantity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {(sku.purchaseHistory || []).length} orders
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        ${sku.totalValue.toFixed(2)}
                                      </span>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {sku.totalPurchased || 0}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        {sku.totalSold || 0}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                        {sku.totalCheckedOut || 0}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        {sku.stockRemaining !== undefined ? sku.stockRemaining : ((sku.totalPurchased || 0) - (sku.totalSold || 0) - (sku.totalCheckedOut || 0))}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                          {(sku.discrepancyHistory || []).reduce((sum, d) => sum + (d.difference || 0), 0)}
                                        </span>
                                        {activeTab === 'sell' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const stockRemaining = (sku.totalPurchased || 0) - (sku.totalSold || 0) - (sku.totalCheckedOut || 0);
                                              let actualCategory = item.categoryName;
                                              const itemNameUpper = sku.itemName.toUpperCase();
                                              const categoryKeywords = ['WHITE', 'BLACK', 'BLUE', 'RED', 'GREEN', 'YELLOW', 'BROWN', 'GRAY', 'GREY', 'ORANGE', 'PINK', 'PURPLE'];
                                              for (const keyword of categoryKeywords) {
                                                if (itemNameUpper.includes(keyword)) {
                                                  actualCategory = keyword;
                                                  break;
                                                }
                                              }
                                              setPrefilledItem({
                                                itemName: sku.itemName,
                                                itemSku: sku.sku,
                                                categoryName: actualCategory,
                                                systemQuantity: stockRemaining
                                              });
                                              setShowDiscrepancyModal(true);
                                            }}
                                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                            title="Add Discrepancy"
                                          >
                                            <PlusIcon className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {(sku.purchaseHistory || []).length} orders | {(sku.salesHistory || []).length} invoices
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        ${sku.totalPurchaseValue.toFixed(2)}
                                      </span>
                                    </td>
                                  </>
                                )}
                              </tr>
                              {}
                              {expandedSKUs.has(sku.sku) && (
                                <>
                                  {activeTab === 'sell' && (
                                    <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                                      <td colSpan="8" className="px-6 py-3">
                                        <div className="grid grid-cols-5 gap-4 text-sm">
                                          <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Total Purchased</div>
                                            <div className="font-bold text-blue-600 dark:text-blue-400">{sku.totalPurchased || 0} units</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Total Sold</div>
                                            <div className="font-bold text-green-600 dark:text-green-400">{sku.totalSold || 0} units</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Checked Out</div>
                                            <div className="font-bold text-orange-600 dark:text-orange-400">{sku.totalCheckedOut || 0} units</div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Remaining Stock</div>
                                            <div className="font-bold text-purple-600 dark:text-purple-400">
                                              {sku.stockRemaining !== undefined ? sku.stockRemaining : ((sku.totalPurchased || 0) - (sku.totalSold || 0) - (sku.totalCheckedOut || 0))} units
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">Net Value</div>
                                            <div className="font-bold text-gray-900 dark:text-white">${((sku.totalSalesValue || 0) - (sku.totalPurchaseValue || 0)).toFixed(2)}</div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {(activeTab === 'use' && sku.purchaseHistory && sku.purchaseHistory.length > 0) && (
                                    <tr>
                                      <td colSpan="4" className="px-0 py-0">
                                        <div className="bg-white dark:bg-gray-900 border-l-4 border-blue-300 dark:border-blue-700 ml-6">
                                          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 font-semibold text-sm">
                                            Purchase History
                                          </div>
                                          <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                              <thead className="bg-blue-50 dark:bg-blue-900/20">
                                                <tr>
                                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Order Number
                                                  </th>
                                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Order Date
                                                  </th>
                                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Quantity
                                                  </th>
                                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Unit Price
                                                  </th>
                                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Line Total
                                                  </th>
                                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Vendor
                                                  </th>
                                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Status
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {sku.purchaseHistory.map((record, recordIndex) => (
                                                  <tr key={recordIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                                      {record.orderNumber}
                                                    </td>
                                                    <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                      {record.orderDate ? new Date(record.orderDate).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-white">
                                                      {record.quantity}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-xs text-gray-900 dark:text-white">
                                                      ${(record.unitPrice || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                                                      ${(record.lineTotal || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                      {record.vendor || '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-xs">
                                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        record.status === 'Complete'
                                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                          : record.status === 'Processing'
                                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                      }`}>
                                                        {record.status}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {activeTab === 'sell' && (
                                    <>
                                      {}
                                      {sku.purchaseHistory && sku.purchaseHistory.length > 0 && (
                                        <tr>
                                          <td colSpan="8" className="px-0 py-0">
                                            <div className="bg-white dark:bg-gray-900 border-l-4 border-blue-300 dark:border-blue-700 ml-6">
                                              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 font-semibold text-sm flex items-center gap-2">
                                                <ShoppingCartIcon className="w-4 h-4" />
                                                Purchase History ({sku.purchaseHistory.length} orders)
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead className="bg-blue-50 dark:bg-blue-900/20">
                                                    <tr>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Order Number
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Order Date
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Quantity
                                                      </th>
                                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Unit Price
                                                      </th>
                                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Line Total
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Vendor
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Status
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {sku.purchaseHistory.map((record, recordIndex) => (
                                                      <tr key={recordIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                                          {record.orderNumber}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.orderDate ? new Date(record.orderDate).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-white">
                                                          {record.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-xs text-gray-900 dark:text-white">
                                                          ${(record.unitPrice || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                                                          ${(record.lineTotal || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.vendor || '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">
                                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            record.status === 'Complete'
                                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                              : record.status === 'Processing'
                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                          }`}>
                                                            {record.status}
                                                          </span>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {}
                                      {sku.salesHistory && sku.salesHistory.length > 0 && (
                                        <tr>
                                          <td colSpan="8" className="px-0 py-0">
                                            <div className="bg-white dark:bg-gray-900 border-l-4 border-green-300 dark:border-green-700 ml-6 mt-2">
                                              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 font-semibold text-sm flex items-center gap-2">
                                                <ShoppingBagIcon className="w-4 h-4" />
                                                Sales History ({sku.salesHistory.length} invoices)
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead className="bg-green-50 dark:bg-green-900/20">
                                                    <tr>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Invoice Number
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Invoice Date
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Quantity
                                                      </th>
                                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Rate
                                                      </th>
                                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Amount
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Customer
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Status
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {sku.salesHistory.map((record, recordIndex) => (
                                                      <tr key={recordIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                                          {record.invoiceNumber}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.invoiceDate ? new Date(record.invoiceDate).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-white">
                                                          {record.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-xs text-gray-900 dark:text-white">
                                                          ${(record.rate || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                                                          ${(record.amount || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.customer || '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">
                                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            record.status === 'Completed' || record.status === 'Closed'
                                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                              : record.status === 'Pending'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                          }`}>
                                                            {record.status}
                                                          </span>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {}
                                      {sku.checkoutHistory && sku.checkoutHistory.length > 0 && (
                                        <tr>
                                          <td colSpan="8" className="px-0 py-0">
                                            <div className="bg-white dark:bg-gray-900 border-l-4 border-orange-300 dark:border-orange-700 ml-6 mt-2">
                                              <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 font-semibold text-sm flex items-center gap-2">
                                                <TruckIcon className="w-4 h-4" />
                                                Checkout History ({sku.checkoutHistory.length} checkouts)
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead className="bg-orange-50 dark:bg-orange-900/20">
                                                    <tr>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Employee
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Truck Number
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Checkout Date
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Quantity
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Notes
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {sku.checkoutHistory.map((record, recordIndex) => (
                                                      <tr key={recordIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                                          {record.employeeName || '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.truckNumber || '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.checkoutDate ? new Date(record.checkoutDate).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-white">
                                                          {record.quantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.notes || '-'}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {}
                                      {sku.discrepancyHistory && sku.discrepancyHistory.length > 0 && (
                                        <tr>
                                          <td colSpan="8" className="px-0 py-0">
                                            <div className="bg-white dark:bg-gray-900 border-l-4 border-red-300 dark:border-red-700 ml-6 mt-2">
                                              <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 font-semibold text-sm flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                Discrepancy History ({sku.discrepancyHistory.length} discrepancies)
                                              </div>
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                  <thead className="bg-red-50 dark:bg-red-900/20">
                                                    <tr>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Invoice Number
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Reported Date
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        System Qty
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Actual Qty
                                                      </th>
                                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Difference
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Type
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Status
                                                      </th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        Reported By
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {sku.discrepancyHistory.map((record, recordIndex) => (
                                                      <tr key={recordIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                                          {record.invoiceNumber}
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.reportedAt ? new Date(record.reportedAt).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs text-gray-900 dark:text-white">
                                                          {record.systemQuantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs text-gray-900 dark:text-white">
                                                          {record.actualQuantity}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-xs font-bold">
                                                          <span className={record.difference > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {record.difference > 0 ? '+' : ''}{record.difference}
                                                          </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">
                                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            record.discrepancyType === 'Overage'
                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                              : record.discrepancyType === 'Shortage'
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                              : record.discrepancyType === 'Damage'
                                                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                          }`}>
                                                            {record.discrepancyType}
                                                          </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs">
                                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            record.status === 'Approved'
                                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                              : record.status === 'Rejected'
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                              : record.status === 'Pending'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                          }`}>
                                                            {record.status}
                                                          </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                                          {record.reportedBy?.fullName || record.reportedBy?.username || '-'}
                                                        </td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={activeTab === 'use' ? '4' : '8'} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              No SKUs mapped to this category
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white uppercase">
                    Total:
                  </td>
                  {activeTab === 'use' ? (
                    <>
                      <td className="px-6 py-4 text-center text-lg text-gray-900 dark:text-white">
                        {currentData.totals.totalQuantity || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {currentData.items.reduce((sum, item) => sum + (item.itemCount || 0), 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-lg text-gray-900 dark:text-white">
                        ${(currentData.totals.totalValue || 0).toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-center text-lg text-blue-600 dark:text-blue-400">
                        {currentData.totals.totalPurchased || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-lg text-green-600 dark:text-green-400">
                        {currentData.totals.totalSold || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-lg text-orange-600 dark:text-orange-400">
                        {currentData.totals.totalCheckedOut || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-lg text-purple-600 dark:text-purple-400">
                        {currentData.totals.stockRemaining || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-lg text-red-600 dark:text-red-400">
                        {currentData.totals.totalDiscrepancyDifference !== undefined ? currentData.totals.totalDiscrepancyDifference : currentData.totals.totalDiscrepancies || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {currentData.items.reduce((sum, item) => sum + (item.itemCount || 0), 0)} / {currentData.items.reduce((sum, item) => sum + (item.invoiceCount || 0), 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-lg text-gray-900 dark:text-white">
                        ${(currentData.totals.totalPurchaseValue || 0).toFixed(2)}
                      </td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
      {}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <ArchiveBoxIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">About Stock Categories:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Use Stock:</strong> Items for internal use - shows purchase history from orders for tracking purposes</li>
              <li><strong>Sell Stock:</strong> Resale inventory - shows both purchase history (orders) AND sales history (invoices) to track inventory flow</li>
              <li><strong>Folder Structure:</strong> Click on a category to view mapped SKUs, then click on a SKU to view detailed history</li>
              <li><strong>Inventory Tracking:</strong> For Sell Stock, you can see Total Purchased, Total Sold, and Remaining Stock for each SKU</li>
            </ul>
          </div>
        </div>
      </Card>
      {}
      {showDiscrepancyModal && (
        <DiscrepancyModal
          onClose={() => {
            setShowDiscrepancyModal(false);
            setPrefilledItem(null);
          }}
          onSuccess={() => {
            setShowDiscrepancyModal(false);
            setPrefilledItem(null);
            loadData(); 
            showSuccess?.('Discrepancy recorded successfully');
          }}
          prefilledItem={prefilledItem}
        />
      )}
    </div>
  );
};
const DiscrepancyModal = ({ onClose, onSuccess, prefilledItem }) => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceId: '',
    invoiceType: 'RouteStarInvoice',
    itemName: prefilledItem?.itemName || '',
    itemSku: prefilledItem?.itemSku || '',
    categoryName: prefilledItem?.categoryName || '',
    systemQuantity: prefilledItem?.systemQuantity || 0,
    actualQuantity: 0,
    discrepancyType: '',
    reason: '',
    notes: prefilledItem ? `Reported from Stock Management for ${prefilledItem.categoryName}` : ''
  });
  const searchInvoices = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setInvoices([]);
      return;
    }
    try {
      setSearchingInvoice(true);
      const response = await discrepancyService.searchInvoices(searchTerm, 10);
      if (response.success) {
        setInvoices(response.data.invoices || []);
      }
    } catch (error) {
      console.error('Search invoices error:', error);
    } finally {
      setSearchingInvoice(false);
    }
  };
  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      ...formData,
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice._id,
      invoiceType: 'RouteStarInvoice',
      itemName: '',
      itemSku: '',
      systemQuantity: 0
    });
    setInvoices([]);
  };
  const handleLineItemSelect = (item) => {
    setFormData({
      ...formData,
      itemName: item.itemName,
      itemSku: item.itemCode || '',
      systemQuantity: item.quantity || 0
    });
  };
  useEffect(() => {
    if (formData.systemQuantity && formData.actualQuantity) {
      const diff = formData.actualQuantity - formData.systemQuantity;
      if (diff > 0 && !formData.discrepancyType) {
        setFormData(prev => ({ ...prev, discrepancyType: 'Overage' }));
      } else if (diff < 0 && !formData.discrepancyType) {
        setFormData(prev => ({ ...prev, discrepancyType: 'Shortage' }));
      }
    }
  }, [formData.systemQuantity, formData.actualQuantity, formData.discrepancyType]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prefilledItem && !formData.invoiceNumber) {
      showError?.('Please select an invoice');
      return;
    }
    if (!formData.itemName) {
      showError?.('Please select an item');
      return;
    }
    if (formData.actualQuantity === formData.systemQuantity) {
      showError?.('Actual quantity matches system quantity - no discrepancy to record');
      return;
    }
    if (!formData.discrepancyType) {
      showError?.('Please select a discrepancy type');
      return;
    }
    try {
      setLoading(true);
      const response = await discrepancyService.createDiscrepancy(formData);
      if (response.success) {
        onSuccess();
      } else {
        showError?.(response.message || 'Failed to record discrepancy');
      }
    } catch (error) {
      showError?.('Error recording discrepancy');
      console.error('Record discrepancy error:', error);
    } finally {
      setLoading(false);
    }
  };
  const difference = formData.actualQuantity - formData.systemQuantity;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Stock Discrepancy</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enter the details of the stock count difference</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {}
          {!prefilledItem && (
            <>
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, invoiceNumber: e.target.value });
                      searchInvoices(e.target.value);
                    }}
                    placeholder="Search invoice by number..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                  {searchingInvoice && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Package className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
                {}
                {invoices.length > 0 && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                    {invoices.map((invoice) => (
                      <button
                        key={invoice._id}
                        type="button"
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {invoice.customerName} • {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {}
              {selectedInvoice && selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Item *
                  </label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                    {selectedInvoice.lineItems.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLineItemSelect(item)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                          formData.itemName === item.itemName ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{item.itemName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {item.itemCode || 'N/A'} • Qty: {item.quantity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {}
          {prefilledItem && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Item Details</h3>
              <div className="space-y-1">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Item:</span> {prefilledItem.itemName}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">SKU:</span> {prefilledItem.itemSku}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Category:</span> {prefilledItem.categoryName}
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Current Stock:</span> {prefilledItem.systemQuantity} units
                </div>
              </div>
            </div>
          )}
          {}
          {formData.itemName && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Quantity
                </label>
                <input
                  type="number"
                  value={formData.systemQuantity}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                />
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actual Quantity (Physical Count) *
                </label>
                <input
                  type="number"
                  value={formData.actualQuantity}
                  onChange={(e) => setFormData({ ...formData, actualQuantity: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter actual counted quantity"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                  min="0"
                  step="1"
                />
              </div>
              {}
              {formData.actualQuantity !== 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Difference:</span>
                    <span className={`text-lg font-bold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </span>
                  </div>
                </div>
              )}
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discrepancy Type *
                </label>
                <select
                  value={formData.discrepancyType}
                  onChange={(e) => setFormData({ ...formData, discrepancyType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Overage">Overage (More than expected)</option>
                  <option value="Shortage">Shortage (Less than expected)</option>
                  <option value="Damage">Damage</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain the reason for this discrepancy..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}
        </form>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.itemName || !formData.discrepancyType}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Package className="w-5 h-5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Record Discrepancy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Stock;
