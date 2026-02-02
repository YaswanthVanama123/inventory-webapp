import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import api from '../../services/api';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const InventoryList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useContext(ToastContext);

  
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

  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || ''); 
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('table'); 
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(20);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  
  useEffect(() => {
    const params = {};
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (statusFilter) params.status = statusFilter;
    if (sortBy !== 'name') params.sortBy = sortBy;
    if (sortOrder !== 'asc') params.sortOrder = sortOrder;
    if (currentPage > 1) params.page = currentPage.toString();

    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, selectedCategory, statusFilter, sortBy, sortOrder, currentPage, setSearchParams]);

  
  useEffect(() => {
    fetchCategories();
  }, []);

  
  useEffect(() => {
    fetchInventoryItems();
  }, [debouncedSearchTerm, selectedCategory, statusFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/categories');
      
      const categoriesData = response.data?.data?.categories || response.data?.categories || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      setCategories([]);
    }
  };

  const fetchInventoryItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      
      if (statusFilter === 'low') {
        params.lowStock = true;
      } else if (statusFilter === 'adequate') {
        params.adequateStock = true;
      }

      const response = await api.get('/inventory', { params });

      setItems(response.data.items || response.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.total || (response.data.items || response.data || []).length);
      setCurrentPage(response.data.currentPage || 1);

      
      if (statusFilter === 'low' && (response.data.items || response.data || []).length > 0) {
        showInfo(`Found ${(response.data.items || response.data || []).length} low stock items`);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      const errorMessage = err.message || 'Failed to load inventory items';
      setError(errorMessage);
      showError(errorMessage);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); 
  };

  const handleAddNew = () => {
    navigate('/inventory/new');
  };

  const handleView = (id) => {
    navigate(`/inventory/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/inventory/${id}/edit`);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/inventory/${itemToDelete._id}`);
      showSuccess(`Successfully deleted "${itemToDelete.name}"`);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchInventoryItems(); 
    } catch (err) {
      console.error('Error deleting item:', err);
      showError(err.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const isLowStock = (item) => {
    return item.quantity <= (item.lowStockThreshold || 10);
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      'Electronics': 'info',
      'Clothing': 'success',
      'Food': 'warning',
      'Books': 'primary',
      'Furniture': 'default',
    };
    return variants[category] || 'default';
  };

  
  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'sku-asc', label: 'SKU (Ascending)' },
    { value: 'sku-desc', label: 'SKU (Descending)' },
    { value: 'quantity-asc', label: 'Stock (Low to High)' },
    { value: 'quantity-desc', label: 'Stock (High to Low)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
  ];

  
  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: cat,
  }));

  
  const statusOptions = [
    { value: '', label: 'All Items' },
    { value: 'low', label: 'Low Stock' },
    { value: 'adequate', label: 'Adequate Stock' },
  ];

  
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading inventory..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Inventory</h1>
            <p className="text-slate-600 mt-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in stock
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              onClick={handleAddNew}
              className="w-full sm:w-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Item
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200">
        <div className="space-y-4">
          {}
          <div className="w-full">
            <SearchBar
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by item name, SKU, or category..."
              fullWidth
              loading={loading && searchTerm !== debouncedSearchTerm}
            />
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {}
            <Select
              name="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="All Categories"
              fullWidth
            />

            {}
            <Select
              name="status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              placeholder="All Items"
              fullWidth
            />

            {}
            <Select
              name="sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              options={sortOptions}
              placeholder="Sort by..."
              fullWidth
            />

            {}
            <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 px-3 py-1.5 rounded font-medium transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Table view"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`flex-1 px-3 py-1.5 rounded font-medium transition-all duration-200 ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory || statusFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-slate-200">
          <LoadingSpinner size="lg" text="Loading..." className="mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <EmptyState
            icon={
              <svg className="w-20 h-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title="No items found"
            description={
              searchTerm || selectedCategory || statusFilter
                ? "Try adjusting your filters or search terms"
                : "Get started by adding your first inventory item"
            }
            action={
              isAdmin && !searchTerm && !selectedCategory && !statusFilter && (
                <Button variant="primary" onClick={handleAddNew}>
                  Add Your First Item
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          {}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {item.image ? (
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-slate-500 truncate max-w-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-mono">{item.skuCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getCategoryBadgeVariant(item.category)}>
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isLowStock(item) ? 'text-red-600' : 'text-slate-900'}`}>
                              {item.quantity}
                            </span>
                            {isLowStock(item) && (
                              <Badge variant="danger" size="sm">
                                Low
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            ${item.price ? item.price.toFixed(2) : '0.00'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(item._id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item._id)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Card View (Mobile-friendly) */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image */}
                  <div className="aspect-square bg-slate-100 relative">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {isLowStock(item) && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="danger" size="sm">
                          Low Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <Badge variant={getCategoryBadgeVariant(item.category)} size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">SKU:</span>
                        <span className="font-mono text-slate-900">{item.skuCode}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Stock:</span>
                        <span className={`font-semibold ${isLowStock(item) ? 'text-red-600' : 'text-slate-900'}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Price:</span>
                        <span className="text-lg font-bold text-slate-900">
                          ${item.price ? item.price.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(item._id)}
                        fullWidth
                      >
                        View
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEdit(item._id)}
                            fullWidth
                          >
                            Edit
                          </Button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
              showPageSize={true}
              showResultCount={true}
            />
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        title="Delete Inventory Item"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </Button>
          </>
        }
      >
        {itemToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">Warning: This action cannot be undone!</p>
                  <p className="text-sm text-red-700 mt-1">
                    The item will be permanently removed from your inventory.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the following item?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {itemToDelete.image ? (
                    <img
                      src={itemToDelete.image}
                      alt={itemToDelete.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https:
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{itemToDelete.name}</p>
                    <p className="text-sm text-gray-600">SKU: {itemToDelete.skuCode}</p>
                    <p className="text-sm text-gray-600">Quantity: {itemToDelete.quantity} units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InventoryList;
