import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Shield, Check, X, Search, Eye, EyeOff, Loader, ChevronDown, ChevronUp, Grid, Lock, Unlock, CheckCircle2, LayoutDashboard, Truck, Users, FileText, Settings, Smartphone, Package, ShoppingBag, ClipboardList, Store, Boxes, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import screenPermissionService from '../../services/screenPermissionService';

const ScreenPermissionsModal = ({ isOpen, onClose, user }) => {
  const [allScreens, setAllScreens] = useState([]);
  const [selectedScreenIds, setSelectedScreenIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    } else if (!isOpen) {
      // Reset state when modal closes
      setAllScreens([]);
      setSelectedScreenIds([]);
      setAlert(null);
      setCategoryFilter('all');
      setSearchTerm('');
      setExpandedCategories(new Set());
    }
  }, [isOpen, user]);

  const loadData = async () => {
    setLoading(true);
    setAlert(null);
    try {
      // Load all available screens
      const screensResponse = await screenPermissionService.getAllScreens();
      const screens = screensResponse.data || [];
      setAllScreens(screens);

      // Load user's current screen permissions
      const userScreensResponse = await screenPermissionService.getUserScreens(user._id || user.id);
      const userScreens = userScreensResponse.data || [];

      // Set currently selected screen IDs
      const selectedIds = userScreens.map(screen => screen._id);
      setSelectedScreenIds(selectedIds);

      // Expand all categories by default
      const categories = [...new Set(screens.map(s => s.category))];
      setExpandedCategories(new Set(categories));
    } catch (error) {
      console.error('Error loading screen permissions:', error);
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to load screen permissions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScreen = (screenId) => {
    setSelectedScreenIds(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleToggleAll = () => {
    const filtered = getFilteredScreens();
    const filteredIds = filtered.map(s => s._id);
    const allSelected = filteredIds.every(id => selectedScreenIds.includes(id));

    if (allSelected) {
      setSelectedScreenIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const newIds = [...selectedScreenIds];
      filteredIds.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      setSelectedScreenIds(newIds);
    }
  };

  const handleSelectCategory = (category) => {
    const categoryScreens = allScreens.filter(s => s.category === category);
    const categoryIds = categoryScreens.map(s => s._id);
    const allCategorySelected = categoryIds.every(id => selectedScreenIds.includes(id));

    if (allCategorySelected) {
      setSelectedScreenIds(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      const newIds = [...selectedScreenIds];
      categoryIds.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      setSelectedScreenIds(newIds);
    }
  };

  const toggleCategoryExpanded = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await screenPermissionService.updateUserPermissions(user._id || user.id, selectedScreenIds);
      setAlert({
        type: 'success',
        message: 'Screen permissions updated successfully!',
      });
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (error) {
      console.error('Error saving screen permissions:', error);
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to update screen permissions',
      });
    } finally {
      setSaving(false);
    }
  };

  const getFilteredScreens = () => {
    let filtered = allScreens;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(screen => screen.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(screen =>
        screen.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const groupScreensByCategory = () => {
    const filtered = getFilteredScreens();
    const grouped = {};

    filtered.forEach(screen => {
      const category = screen.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(screen);
    });

    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.displayName.localeCompare(b.displayName);
      });
    });

    return grouped;
  };

  const categories = [...new Set(allScreens.map(s => s.category))].sort();
  const groupedScreens = groupScreensByCategory();
  const totalScreens = allScreens.length;
  const selectedCount = selectedScreenIds.length;
  const filteredScreens = getFilteredScreens();

  const getCategoryIcon = (category) => {
    const icons = {
      'Dashboard': LayoutDashboard,
      'RouteStar': Truck,
      'CustomerConnect': Users,
      'Reports': FileText,
      'Settings': Settings,
      'Stock': Package,
      'Checkouts': ShoppingBag,
      'Manual PO Items': ClipboardList,
      'Vendors': Store,
      'Inventory Items': Boxes,
      'Discrepancies': AlertTriangle,
      'Other': Smartphone
    };
    return icons[category] || Smartphone;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Dashboard': 'bg-blue-50 text-blue-700 border-blue-200',
      'RouteStar': 'bg-green-50 text-green-700 border-green-200',
      'CustomerConnect': 'bg-purple-50 text-purple-700 border-purple-200',
      'Reports': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Settings': 'bg-gray-50 text-gray-700 border-gray-200',
      'Stock': 'bg-amber-50 text-amber-700 border-amber-200',
      'Checkouts': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Manual PO Items': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'Vendors': 'bg-rose-50 text-rose-700 border-rose-200',
      'Inventory Items': 'bg-violet-50 text-violet-700 border-violet-200',
      'Discrepancies': 'bg-orange-50 text-orange-700 border-orange-200',
      'Other': 'bg-pink-50 text-pink-700 border-pink-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !saving && onClose(false)}
      title=""
      size="xl"
      closeOnOverlayClick={!saving}
      hideFooter
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Screen Permissions</h2>
                <p className="text-sm text-gray-500 mt-0.5">Control access to application screens</p>
              </div>
            </div>
            <button
              onClick={() => !saving && onClose(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl font-semibold text-indigo-600 border-2 border-indigo-200">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-lg border border-indigo-200">
                <span className="text-xs font-medium text-indigo-700 uppercase">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className="px-6 pt-4">
            <Alert variant={alert.type} dismissible onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500">Loading permissions...</p>
          </div>
        ) : (
          <>
            {/* Filters & Stats */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search screens by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white min-w-[180px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-bold text-indigo-600">{selectedCount}</span>
                      <span className="text-gray-500"> / {totalScreens} selected</span>
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {allScreens.filter(s => s.isDefault).length} default
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleAll}
                  disabled={filteredScreens.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {filteredScreens.every(s => selectedScreenIds.includes(s._id)) ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Select All
                    </>
                  )}
                </button>
              </div>

              {/* Category Quick Access Chips */}
              {categoryFilter === 'all' && !searchTerm && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map(category => {
                    const categoryScreens = allScreens.filter(s => s.category === category);
                    const selectedInCategory = categoryScreens.filter(s => selectedScreenIds.includes(s._id)).length;
                    const totalInCategory = categoryScreens.length;
                    const allSelected = selectedInCategory === totalInCategory;
                    const CategoryIcon = getCategoryIcon(category);

                    return (
                      <button
                        key={category}
                        onClick={() => handleSelectCategory(category)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                          allSelected
                            ? getCategoryColor(category) + ' border-current'
                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <CategoryIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">{category}</span>
                        <span className="text-xs opacity-75">({selectedInCategory}/{totalInCategory})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Screens List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {Object.keys(groupedScreens).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Grid className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">No screens found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupedScreens).map(([category, screens]) => {
                    const isExpanded = expandedCategories.has(category);
                    const selectedInCategory = screens.filter(s => selectedScreenIds.includes(s._id)).length;
                    const totalInCategory = screens.length;
                    const allSelected = selectedInCategory === totalInCategory;
                    const CategoryIcon = getCategoryIcon(category);

                    return (
                      <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Category Header */}
                        <div className={`${getCategoryColor(category)} border-b`}>
                          <div className="flex items-center justify-between p-4">
                            <button
                              onClick={() => toggleCategoryExpanded(category)}
                              className="flex items-center gap-3 flex-1"
                            >
                              <div className="p-1.5 bg-white bg-opacity-50 rounded-lg">
                                <CategoryIcon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-bold text-lg">{category}</h3>
                                <p className="text-xs opacity-75">
                                  {selectedInCategory} of {totalInCategory} screens selected
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 ml-auto" />
                              ) : (
                                <ChevronDown className="w-5 h-5 ml-auto" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSelectCategory(category)}
                              className={`ml-3 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                                allSelected
                                  ? 'bg-white text-current border-current hover:bg-opacity-90'
                                  : 'bg-white border-gray-300 text-gray-600 hover:border-current hover:text-current'
                              }`}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1 bg-white bg-opacity-50">
                            <div
                              className="h-full bg-current transition-all duration-300"
                              style={{ width: `${(selectedInCategory / totalInCategory) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Screens */}
                        {isExpanded && (
                          <div className="divide-y divide-gray-100">
                            {screens.map(screen => {
                              const isSelected = selectedScreenIds.includes(screen._id);
                              const isDefault = screen.isDefault;

                              return (
                                <label
                                  key={screen._id}
                                  className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors group ${
                                    isSelected ? 'bg-indigo-50 bg-opacity-50' : ''
                                  }`}
                                >
                                  {/* Custom Checkbox */}
                                  <div className="flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleScreen(screen._id)}
                                      className="hidden"
                                    />
                                    <div
                                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        isSelected
                                          ? 'bg-indigo-600 border-indigo-600'
                                          : 'border-gray-300 group-hover:border-indigo-400'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                  </div>

                                  {/* Screen Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-gray-900">
                                        {screen.displayName}
                                      </p>
                                      {isDefault && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                          <Lock className="w-3 h-3" />
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    {screen.description && (
                                      <p className="text-sm text-gray-600 mb-1">
                                        {screen.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 font-mono">
                                      {screen.path}
                                    </p>
                                  </div>

                                  {/* Selection Indicator */}
                                  {isSelected && (
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-indigo-600" />
                                      </div>
                                    </div>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-blue-700" />
                  </div>
                  <span>Default screens are automatically accessible to all employees</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {selectedCount - allScreens.filter(s => s.isDefault && selectedScreenIds.includes(s._id)).length} additional permissions
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose(false)}
                  disabled={saving}
                  fullWidth
                  className="py-3"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                  disabled={loading || saving}
                  fullWidth
                  className="py-3"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save Permissions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

ScreenPermissionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    fullName: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default ScreenPermissionsModal;
