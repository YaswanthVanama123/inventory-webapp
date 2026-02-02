import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Trash2, RotateCcw, AlertTriangle, Search, Filter } from 'lucide-react';

const Trash = () => {
  const { showSuccess, showError, showInfo } = useContext(ToastContext);
  const [loading, setLoading] = useState(true);
  const [deletedItems, setDeletedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, inventory, invoices, users
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch deleted items
      // For now, using placeholder data
      setDeletedItems([]);
      showInfo('Trash feature coming soon');
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      showError('Failed to load trash items');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      // TODO: Implement restore API call
      showSuccess(`${item.name} restored successfully`);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      showError('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement permanent delete API call
      showSuccess('Item permanently deleted');
      fetchDeletedItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      showError('Failed to delete item');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to empty the entire trash? This will permanently delete all items and cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement empty trash API call
      showSuccess('Trash emptied successfully');
      fetchDeletedItems();
    } catch (error) {
      console.error('Error emptying trash:', error);
      showError('Failed to empty trash');
    }
  };

  const filteredItems = deletedItems.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading trash..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 lg:px-8 py-8 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-md">
              <Trash2 className="w-7 h-7 text-white" />
            </div>
            Trash
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2 ml-1">
            Restore or permanently delete items
          </p>
        </div>

        {/* Filters and Actions */}
        <Card padding="lg" className="mb-6 border border-slate-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search deleted items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Items</option>
                <option value="inventory">Inventory</option>
                <option value="invoices">Invoices</option>
                <option value="users">Users</option>
              </select>
            </div>

            {/* Empty Trash Button */}
            {deletedItems.length > 0 && (
              <Button
                variant="danger"
                onClick={handleEmptyTrash}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Empty Trash
              </Button>
            )}
          </div>
        </Card>

        {/* Deleted Items List */}
        {filteredItems.length === 0 ? (
          <Card padding="lg" className="text-center py-20 border border-slate-200 dark:border-gray-700">
            <Trash2 className="w-20 h-20 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {deletedItems.length === 0 ? 'Trash is empty' : 'No items found'}
            </h3>
            <p className="text-slate-600 dark:text-gray-400">
              {deletedItems.length === 0
                ? 'Deleted items will appear here'
                : 'Try adjusting your search or filter'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                padding="lg"
                className="border border-slate-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <Badge variant="default">{item.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      Deleted on {new Date(item.deletedAt).toLocaleDateString()}
                    </p>
                    {item.deletedBy && (
                      <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">
                        Deleted by: {item.deletedBy}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePermanentDelete(item)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Warning Note */}
        <Card padding="lg" className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                Important Notice
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Items in trash are kept for 30 days before being permanently deleted.
                Once permanently deleted, items cannot be recovered.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Trash;
