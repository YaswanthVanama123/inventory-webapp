import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarItemsService from '../../services/routeStarItemsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { MagnifyingGlassIcon, ArrowPathIcon, ChartBarIcon, ShoppingBagIcon, CurrencyDollarIcon, DocumentTextIcon, ChevronRightIcon, ChevronDownIcon, FolderIcon } from '@heroicons/react/24/outline';

const SalesReport = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  
  useEffect(() => {
    if (searchText) {
      const filtered = items.filter(item =>
        item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.itemParent && item.itemParent.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchText, items]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await routeStarItemsService.getSalesReport();

      setItems(response.items || []);
      setFilteredItems(response.items || []);
      setTotals(response.totals || {});

      showSuccess('Sales report loaded successfully');
    } catch (error) {
      console.error('Error loading sales report:', error);
      showError('Failed to load sales report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            RouteStar Items Sales Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all RouteStar items and their sold quantities from invoices
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            <div>
              <div className="text-3xl font-bold">{totals.totalItems || 0}</div>
              <div className="text-sm opacity-90">Total Items</div>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-6 h-6" />
            <div>
              <div className="text-3xl font-bold">{totals.totalSoldQuantity || 0}</div>
              <div className="text-sm opacity-90">Total Sold Quantity</div>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6" />
            <div>
              <div className="text-3xl font-bold">${(totals.totalSoldAmount || 0).toFixed(2)}</div>
              <div className="text-sm opacity-90">Total Sales Amount</div>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6" />
            <div>
              <div className="text-3xl font-bold">{totals.totalInvoices || 0}</div>
              <div className="text-sm opacity-90">Total Invoices</div>
            </div>
          </div>
        </Card>
      </div>

      {}
      <Card>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty On Hand
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sold Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sales Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invoices
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <React.Fragment key={item._id}>
                    {}
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleItemClick(item._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedItems.has(item._id) ? (
                            <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {item.itemParent || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span className={item.qtyOnHand < 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white'}>
                          {item.qtyOnHand || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`text-lg font-bold ${item.soldQuantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.soldQuantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${(item.soldAmount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          {item.invoiceCount || 0}
                        </span>
                      </td>
                    </tr>

                    {}
                    {expandedItems.has(item._id) && (
                      <tr>
                        <td colSpan="8" className="px-0 py-0">
                          {item.invoiceDetails && item.invoiceDetails.length > 0 ? (
                            <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-500 ml-16">
                              <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 font-semibold text-sm">
                                Invoice Details ({item.invoiceDetails.length} entries)
                              </div>
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className="bg-blue-50 dark:bg-blue-900/20">
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
                                    {item.invoiceDetails.map((invoice, invIndex) => (
                                      <tr key={invIndex} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                          {invoice.invoiceNumber}
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                          {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs font-medium text-gray-900 dark:text-white">
                                          {invoice.quantity}
                                        </td>
                                        <td className="px-4 py-2 text-right text-xs text-gray-900 dark:text-white">
                                          ${(invoice.rate || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                                          ${(invoice.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                          {invoice.customer || '-'}
                                        </td>
                                        <td className="px-4 py-2 text-xs">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            invoice.status === 'Completed' || invoice.status === 'Closed'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                          }`}>
                                            {invoice.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600 ml-16 py-8">
                              <div className="text-center text-gray-500 dark:text-gray-400">
                                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No invoice entries found</p>
                                <p className="text-xs mt-1">This item has not been sold in any invoices yet</p>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr className="font-bold">
                <td colSpan="5" className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white uppercase">
                  Total:
                </td>
                <td className="px-6 py-4 text-center text-lg text-green-600 dark:text-green-400">
                  {filteredItems.reduce((sum, item) => sum + (item.soldQuantity || 0), 0)}
                </td>
                <td className="px-6 py-4 text-right text-lg text-gray-900 dark:text-white">
                  ${filteredItems.reduce((sum, item) => sum + (item.soldAmount || 0), 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                  {filteredItems.reduce((sum, item) => sum + (item.invoiceCount || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">About Sales Report:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Shows all RouteStar items from your inventory</li>
              <li>Displays sold quantities based on completed invoices</li>
              <li>Items with no sales will show 0 sold quantity</li>
              <li><strong>Click on any item</strong> to expand and view detailed invoice entries</li>
              <li>Negative "Qty On Hand" (shown in red) indicates items need restocking in RouteStar</li>
              <li>Sales data is aggregated from all invoices where the item name matches</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesReport;
