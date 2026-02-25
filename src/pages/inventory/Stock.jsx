import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import stockService from '../../services/stockService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArchiveBoxIcon, ShoppingCartIcon, ShoppingBagIcon, ArrowPathIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentTextIcon, TruckIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await stockService.getStockSummary();

      setUseStockData(response.useStock || { items: [], totals: {} });
      setSellStockData(response.sellStock || { items: [], totals: {} });

      showSuccess('Stock data loaded successfully');
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
          onClick={loadData}
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

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 ${activeTab === 'sell' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        {activeTab === 'use' ? (
          <>
            {/* Total Categories */}
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

            {/* Total Quantity */}
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

            {/* Total Value */}
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
            {/* Total Purchased */}
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

            {/* Total Sold */}
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

            {/* Total Checked Out */}
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

            {/* Stock Remaining */}
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
                            <td colSpan={activeTab === 'use' ? '4' : '7'} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
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
                                        {(sku.totalPurchased || 0) - (sku.totalSold || 0) - (sku.totalCheckedOut || 0)}
                                      </span>
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
                                      <td colSpan="7" className="px-6 py-3">
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
                                            <div className="font-bold text-purple-600 dark:text-purple-400">{(sku.totalPurchased || 0) - (sku.totalSold || 0) - (sku.totalCheckedOut || 0)} units</div>
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
                                          <td colSpan="7" className="px-0 py-0">
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
                                          <td colSpan="7" className="px-0 py-0">
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

                                      {/* Checkout History */}
                                      {sku.checkoutHistory && sku.checkoutHistory.length > 0 && (
                                        <tr>
                                          <td colSpan="7" className="px-0 py-0">
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
                                    </>
                                  )}
                                </>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={activeTab === 'use' ? '4' : '7'} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
    </div>
  );
};

export default Stock;
