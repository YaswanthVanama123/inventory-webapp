import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import routestarService from '../../services/routestarService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import {
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ArrowPathIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const ItemsInvoiceUsage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.aliases.some(alias => alias.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await routestarService.getItemsInvoiceUsage();
      setItems(response.data.items || []);
      setTotals(response.data.totals || {});
      setFilteredItems(response.data.items || []);
      showSuccess('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemName) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  const handleInvoiceClick = (invoiceNumber) => {
    navigate(`/invoices/routestar/${invoiceNumber}`);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Items Invoice Usage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all item names and their invoice usage in a folder structure
          </p>
        </div>
        <Button variant="secondary" onClick={loadData} size="sm">
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{totals.totalItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mapped Items</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-500">{totals.totalMappedItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <TagIcon className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Unique Items</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{totals.totalUniqueItems || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">{totals.totalInvoices || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by item name or alias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Items Table */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Items ({filteredItems.length} items)
        </h2>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery ? 'No items found matching your search' : 'No items available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aliases
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Invoices
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Sold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item, index) => (
                  <React.Fragment key={item.itemName}>
                    {/* Main Item Row */}
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleItemClick(item.itemName)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedItems.has(item.itemName) ? (
                            <ChevronDownIcon className="w-4 h-4 mr-2 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <FolderIcon className={`w-5 h-5 mr-3 ${item.type === 'mapped' ? 'text-purple-500' : 'text-green-500'}`} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={item.type === 'mapped' ? 'purple' : 'success'}>
                          {item.type === 'mapped' ? 'Mapped' : 'Unique'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.aliases.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            {item.aliases.length} aliases
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.invoiceCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.totalQuantitySold}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Section - Aliases */}
                    {expandedItems.has(item.itemName) && item.aliases.length > 0 && (
                      <tr className="bg-purple-50 dark:bg-purple-900/10">
                        <td colSpan="5" className="px-6 py-3">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">Aliases:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.aliases.map((alias, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                >
                                  {alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expanded Section - Invoices */}
                    {expandedItems.has(item.itemName) && item.invoices.length > 0 && (
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="border-l-4 border-indigo-500 pl-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <DocumentTextIcon className="w-5 h-5" />
                              Invoices ({item.invoices.length})
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-indigo-50 dark:bg-indigo-900/20">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Invoice Number
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Date
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Customer
                                    </th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Quantity
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {item.invoices.map((invoice, invIdx) => (
                                    <tr
                                      key={invIdx}
                                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                      onClick={() => handleInvoiceClick(invoice.invoiceNumber)}
                                    >
                                      <td className="px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {invoice.invoiceNumber}
                                      </td>
                                      <td className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                                        {formatDate(invoice.invoiceDate)}
                                      </td>
                                      <td className="px-4 py-2 text-xs text-gray-900 dark:text-white">
                                        {invoice.customer}
                                      </td>
                                      <td className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white">
                                        {invoice.totalQuantity}
                                      </td>
                                      <td className="px-4 py-2 text-xs">
                                        <Badge
                                          variant={
                                            invoice.status === 'Completed' || invoice.status === 'Closed'
                                              ? 'success'
                                              : 'warning'
                                          }
                                        >
                                          {invoice.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white">
                                        ${(invoice.total || 0).toFixed(2)}
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
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ItemsInvoiceUsage;
