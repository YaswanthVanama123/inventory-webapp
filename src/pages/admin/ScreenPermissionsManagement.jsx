import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import screenPermissionService from '../../services/screenPermissionService';
import {
  Shield,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  RefreshCw,
  Save,
  LayoutDashboard,
  Truck,
  Users as UsersIcon,
  ClipboardCheck,
  FileText,
  Settings as SettingsIcon,
  Package,
  ShoppingBag,
  ClipboardList,
  Store,
  Boxes,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const ScreenPermissionsManagement = () => {
  const { showSuccess, showError } = useContext(ToastContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Screens data
  const [allScreens, setAllScreens] = useState([]);
  const [defaultScreenIds, setDefaultScreenIds] = useState([]);

  // Users data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScreenIds, setUserScreenIds] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState('default'); // 'default' or 'users'

  // Modal state
  const [showInitializeModal, setShowInitializeModal] = useState(false);

  // Expanded categories for user permissions tab
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all screens
      const screensResult = await screenPermissionService.getAllScreens();
      if (screensResult.success) {
        setAllScreens(screensResult.data);

        // Set default screen IDs
        const defaultIds = screensResult.data
          .filter(screen => screen.isDefault)
          .map(screen => screen._id);
        setDefaultScreenIds(defaultIds);

        // Expand all categories by default
        const categories = [...new Set(screensResult.data.map(s => s.category))];
        setExpandedCategories(new Set(categories));
      }

      // Fetch all users
      const usersResult = await screenPermissionService.getAllUsersWithPermissions();
      if (usersResult.success) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load screen permissions data');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Dashboard': LayoutDashboard,
      'RouteStar': Truck,
      'CustomerConnect': UsersIcon,
      'Reports': FileText,
      'Settings': SettingsIcon,
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

  const handleInitializeScreens = async () => {
    setShowInitializeModal(true);
  };

  const confirmInitializeScreens = async () => {
    try {
      setSaving(true);
      const result = await screenPermissionService.initializeScreens();

      if (result.success) {
        showSuccess('Screens initialized successfully');
        await fetchData();
        setShowInitializeModal(false);
      }
    } catch (error) {
      console.error('Error initializing screens:', error);
      showError('Failed to initialize screens');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDefaultScreens = async () => {
    try {
      setSaving(true);
      const result = await screenPermissionService.updateDefaultScreens(defaultScreenIds);

      if (result.success) {
        showSuccess('Default screens updated successfully');
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating default screens:', error);
      showError('Failed to update default screens');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDefaultScreen = (screenId) => {
    setDefaultScreenIds(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleSelectUser = async (user) => {
    try {
      setSelectedUser(user);

      // Fetch user's screens
      const result = await screenPermissionService.getUserScreens(user._id);
      if (result.success) {
        const screenIds = result.data.map(screen => screen._id);
        setUserScreenIds(screenIds);
      }
    } catch (error) {
      console.error('Error fetching user screens:', error);
      showError('Failed to load user screens');
    }
  };

  const handleToggleUserScreen = (screenId) => {
    setUserScreenIds(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const result = await screenPermissionService.updateUserPermissions(
        selectedUser._id,
        userScreenIds
      );

      if (result.success) {
        showSuccess(`Permissions updated for ${selectedUser.name}`);
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating user permissions:', error);
      showError('Failed to update user permissions');
    } finally {
      setSaving(false);
    }
  };

  const groupScreensByCategory = (screens) => {
    const grouped = {};
    screens.forEach(screen => {
      if (!grouped[screen.category]) {
        grouped[screen.category] = [];
      }
      grouped[screen.category].push(screen);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const groupedScreens = groupScreensByCategory(allScreens);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              Screen Permissions
            </h1>
            <p className="text-slate-600 mt-1">
              Manage which screens employees can access
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleInitializeScreens}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Initialize Screens
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('default')}
              className={`${
                activeTab === 'default'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-all`}
            >
              Default Screens
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-all`}
            >
              User-Specific Permissions
            </button>
          </nav>
        </div>

        {/* Default Screens Tab */}
        {activeTab === 'default' && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  Default Screens for All Employees
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Select which screens should be accessible to all employees by default
                </p>
                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-700">
                      <span className="font-bold text-indigo-600">{defaultScreenIds.length}</span>
                      <span className="text-gray-500"> / {allScreens.length} selected</span>
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleSaveDefaultScreens}
                loading={saving}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

            {/* Screens by Category */}
            <div className="space-y-3">
              {Object.entries(groupedScreens).map(([category, screens]) => {
                const CategoryIcon = getCategoryIcon(category);
                const enabledCount = screens.filter(s => defaultScreenIds.includes(s._id)).length;
                const totalCount = screens.length;

                return (
                  <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className={`${getCategoryColor(category)} border-b p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white bg-opacity-50 rounded-lg">
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{category}</h3>
                            <p className="text-xs opacity-75">
                              {enabledCount} of {totalCount} screens enabled
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium bg-white bg-opacity-50 px-3 py-1 rounded-full">
                          {enabledCount}/{totalCount}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-1 bg-white bg-opacity-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-current transition-all duration-300"
                          style={{ width: `${(enabledCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 divide-y divide-gray-100">
                      {screens.map(screen => {
                        const isChecked = defaultScreenIds.includes(screen._id);
                        return (
                          <label
                            key={screen._id}
                            className={`flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors px-2 rounded-lg ${
                              isChecked ? 'bg-indigo-50 bg-opacity-50' : ''
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleDefaultScreen(screen._id)}
                                className="hidden"
                              />
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'border-gray-300 hover:border-indigo-400'
                                }`}
                              >
                                {isChecked && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">{screen.displayName}</p>
                              {screen.description && (
                                <p className="text-sm text-gray-600">{screen.description}</p>
                              )}
                              <p className="text-xs text-gray-500 font-mono mt-1">{screen.path}</p>
                            </div>
                            {isChecked && (
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User-Specific Permissions Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Users List */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {users.map(user => {
                  const isSelected = selectedUser?._id === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all duration-200 border-2
                        ${isSelected
                          ? 'bg-indigo-50 border-indigo-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                          ${isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                          }
                        `}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {user.name}
                          </div>
                          <div className={`text-xs truncate ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                              ${isSelected
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              <Shield className="w-3 h-3" />
                              {user.totalScreensCount} screens
                            </span>
                            {user.additionalScreensCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                +{user.additionalScreensCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screen Permissions for Selected User */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <>
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Permissions for {selectedUser.name}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Manage screen access for this employee
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleSaveUserPermissions}
                        loading={saving}
                        disabled={saving}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <span className="font-semibold text-gray-900">{userScreenIds.filter(id => defaultScreenIds.includes(id)).length}</span> default
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <span className="font-semibold text-gray-900">{userScreenIds.filter(id => !defaultScreenIds.includes(id)).length}</span> additional
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="text-gray-700">
                          <span className="font-semibold text-gray-900">{userScreenIds.length}</span> total
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {Object.entries(groupedScreens).map(([category, screens]) => {
                      const CategoryIcon = getCategoryIcon(category);
                      const isExpanded = expandedCategories.has(category);
                      const selectedInCategory = screens.filter(s => userScreenIds.includes(s._id)).length;
                      const totalInCategory = screens.length;

                      return (
                        <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                                  <h3 className="font-bold text-base">{category}</h3>
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
                              <span className="ml-3 text-sm font-medium bg-white bg-opacity-50 px-3 py-1 rounded-full">
                                {selectedInCategory}/{totalInCategory}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1 bg-white bg-opacity-50">
                              <div
                                className="h-full bg-current transition-all duration-300"
                                style={{ width: `${(selectedInCategory / totalInCategory) * 100}%` }}
                              />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="divide-y divide-gray-100">
                              {screens.map(screen => {
                                const isDefault = defaultScreenIds.includes(screen._id);
                                const isSelected = userScreenIds.includes(screen._id);

                                return (
                                  <label
                                    key={screen._id}
                                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                      isSelected ? 'bg-indigo-50 bg-opacity-50' : ''
                                    }`}
                                  >
                                    <div className="flex-shrink-0">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleUserScreen(screen._id)}
                                        className="hidden"
                                      />
                                      <div
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                          isSelected
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'border-gray-300 hover:border-indigo-400'
                                        }`}
                                      >
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                      </div>
                                    </div>
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employee Selected</h3>
                  <p className="text-gray-500 max-w-sm">
                    Select an employee from the list on the left to view and manage their screen permissions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Initialize Screens Confirmation Modal */}
      <Modal
        isOpen={showInitializeModal}
        onClose={() => !saving && setShowInitializeModal(false)}
        title="Initialize Screens"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowInitializeModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmInitializeScreens}
              loading={saving}
              disabled={saving}
            >
              Initialize
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800">Initialize Default Screens</p>
            <p className="text-sm text-blue-700 mt-1">
              This will create default screens based on your application routes.
            </p>
          </div>
          <p className="text-sm text-gray-700">
            Are you sure you want to initialize the screens?
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ScreenPermissionsManagement;
