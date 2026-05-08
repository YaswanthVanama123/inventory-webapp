import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import screenPermissionService from '../../services/screenPermissionService';
import { Plus, Edit, Trash2, Shield, Eye, RefreshCw, Grid, Check, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';

const ScreenManagement = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    path: '',
    icon: 'ViewGridIcon',
    category: 'Other',
    description: '',
    isDefault: false,
    isActive: true,
    order: 0
  });

  const categories = [
    'Dashboard',
    'RouteStar',
    'CustomerConnect',
    'Reports',
    'Settings',
    'Stock',
    'Checkouts',
    'Manual PO Items',
    'Vendors',
    'Inventory Items',
    'Discrepancies',
    'Other'
  ];

  useEffect(() => {
    if (isAdmin) {
      fetchScreens();
    }
  }, [isAdmin]);

  const fetchScreens = async () => {
    setLoading(true);
    try {
      const response = await screenPermissionService.getAllScreens();
      setScreens(response.data || []);
    } catch (error) {
      console.error('Error fetching screens:', error);
      showError(error.message || 'Failed to load screens');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScreen = () => {
    setSelectedScreen(null);
    setFormData({
      name: '',
      displayName: '',
      path: '',
      icon: 'ViewGridIcon',
      category: 'Other',
      description: '',
      isDefault: false,
      isActive: true,
      order: 0
    });
    setShowAddEditModal(true);
  };

  const handleEditScreen = (screen) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name,
      displayName: screen.displayName,
      path: screen.path,
      icon: screen.icon || 'ViewGridIcon',
      category: screen.category,
      description: screen.description || '',
      isDefault: screen.isDefault,
      isActive: screen.isActive,
      order: screen.order
    });
    setShowAddEditModal(true);
  };

  const handleDeleteScreen = (screen) => {
    setSelectedScreen(screen);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (selectedScreen) {
        // Update existing screen
        await screenPermissionService.updateScreen(selectedScreen._id, formData);
        showSuccess('Screen updated successfully');
      } else {
        // Create new screen
        await screenPermissionService.createScreen(formData);
        showSuccess('Screen created successfully');
      }
      setShowAddEditModal(false);
      fetchScreens();
    } catch (error) {
      console.error('Error saving screen:', error);
      showError(error.message || 'Failed to save screen');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    setModalLoading(true);
    try {
      await screenPermissionService.deleteScreen(selectedScreen._id);
      showSuccess('Screen deleted successfully');
      setShowDeleteModal(false);
      fetchScreens();
    } catch (error) {
      console.error('Error deleting screen:', error);
      showError(error.message || 'Failed to delete screen');
    } finally {
      setModalLoading(false);
    }
  };

  const handleInitializeScreens = async () => {
    if (!window.confirm('This will initialize default screens. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      await screenPermissionService.initializeScreens();
      showSuccess('Screens initialized successfully');
      fetchScreens();
    } catch (error) {
      console.error('Error initializing screens:', error);
      showError(error.message || 'Failed to initialize screens');
    } finally {
      setLoading(false);
    }
  };

  const filteredScreens = screens.filter(screen => {
    const matchesSearch = !searchTerm ||
      screen.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.path?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || screen.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">You do not have permission to access this page.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              Screen Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage application screens and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleInitializeScreens}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Initialize Screens
            </Button>
            <Button variant="primary" onClick={handleAddScreen} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Screen
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, path..."
            fullWidth
          />
          <Select
            name="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categories.map(cat => ({ value: cat, label: cat }))}
            placeholder="All Categories"
            fullWidth
          />
        </div>
      </div>

      {/* Screens List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-slate-200">
          <LoadingSpinner size="lg" text="Loading screens..." className="mx-auto" />
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <EmptyState
            icon={<Grid className="w-20 h-20 text-gray-300" />}
            title="No screens found"
            description={searchTerm || categoryFilter ? 'Try adjusting your filters' : 'Get started by adding your first screen'}
            action={
              !searchTerm && !categoryFilter && (
                <Button variant="primary" onClick={handleAddScreen}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Screen
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Screen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Default
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredScreens.map((screen) => (
                  <tr key={screen._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{screen.displayName}</div>
                        <div className="text-sm text-slate-500">{screen.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-mono">{screen.path}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info">{screen.category}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={screen.isActive ? 'success' : 'danger'} dot>
                        {screen.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {screen.isDefault ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditScreen(screen)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScreen(screen)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => !modalLoading && setShowAddEditModal(false)}
        title={selectedScreen ? 'Edit Screen' : 'Add New Screen'}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowAddEditModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={modalLoading}
              disabled={modalLoading}
            >
              {selectedScreen ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Internal) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="dashboard-overview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Dashboard Overview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Path *
              </label>
              <input
                type="text"
                name="path"
                value={formData.path}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="/dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ViewGridIcon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Description of the screen"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleFormChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Default Screen</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !modalLoading && setShowDeleteModal(false)}
        title="Delete Screen"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={modalLoading}
              disabled={modalLoading}
            >
              Delete
            </Button>
          </>
        }
      >
        {selectedScreen && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">
                Warning: This action cannot be undone!
              </p>
              <p className="text-sm text-red-700 mt-1">
                All user permissions for this screen will also be deleted.
              </p>
            </div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the screen:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{selectedScreen.displayName}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedScreen.path}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScreenManagement;
