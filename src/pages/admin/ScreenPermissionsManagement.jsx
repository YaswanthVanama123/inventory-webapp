import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import screenPermissionService from '../../services/screenPermissionService';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Screen Permissions Management</h1>
          <p className="text-gray-600 mt-1">Manage which screens employees can access</p>
        </div>
        <button
          onClick={handleInitializeScreens}
          disabled={saving}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
        >
          Initialize Screens
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('default')}
            className={`${
              activeTab === 'default'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Default Screens
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User-Specific Permissions
          </button>
        </nav>
      </div>

      {/* Default Screens Tab */}
      {activeTab === 'default' && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Default Screens for All Employees
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Select which screens should be accessible to all employees by default. Individual permissions can be customized in the User-Specific Permissions tab.
                  </p>
                </div>
                <button
                  onClick={handleSaveDefaultScreens}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">{defaultScreenIds.length}</span> screens enabled
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">
                    <span className="font-semibold text-gray-900">{allScreens.length - defaultScreenIds.length}</span> screens disabled
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Screens by Category */}
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(groupedScreens).map(([category, screens], index) => {
              const categoryColors = {
                'Dashboard': 'from-purple-500 to-purple-600',
                'Inventory': 'from-blue-500 to-blue-600',
                'Orders': 'from-green-500 to-green-600',
                'Invoices': 'from-yellow-500 to-yellow-600',
                'Reports': 'from-red-500 to-red-600',
                'Users': 'from-indigo-500 to-indigo-600',
                'Settings': 'from-gray-500 to-gray-600',
                'RouteStar': 'from-teal-500 to-teal-600',
                'GoAudits': 'from-pink-500 to-pink-600',
                'Stock': 'from-orange-500 to-orange-600',
              };

              const gradientClass = categoryColors[category] || 'from-slate-500 to-slate-600';
              const enabledCount = screens.filter(s => defaultScreenIds.includes(s._id)).length;

              return (
                <Card key={category} className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${gradientClass} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {category}
                      </h3>
                      <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        {enabledCount}/{screens.length} enabled
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {screens.map(screen => {
                        const isChecked = defaultScreenIds.includes(screen._id);
                        return (
                          <label
                            key={screen._id}
                            className={`
                              group relative flex items-start space-x-3 p-4 rounded-xl cursor-pointer
                              transition-all duration-200 border-2
                              ${isChecked
                                ? 'bg-green-50 border-green-300 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }
                            `}
                          >
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleDefaultScreen(screen._id)}
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold text-sm ${isChecked ? 'text-green-900' : 'text-gray-900'}`}>
                                  {screen.displayName}
                                </span>
                                {isChecked && (
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className={`text-xs mt-1 font-mono ${isChecked ? 'text-green-700' : 'text-gray-500'}`}>
                                {screen.path}
                              </div>
                              {screen.description && (
                                <div className={`text-xs mt-1.5 ${isChecked ? 'text-green-600' : 'text-gray-400'}`}>
                                  {screen.description}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Save Button */}
          <div className="flex justify-end sticky bottom-4">
            <button
              onClick={handleSaveDefaultScreens}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 transition-all shadow-lg hover:shadow-xl font-semibold text-base"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </span>
              ) : (
                'Save Default Screens'
              )}
            </button>
          </div>
        </div>
      )}

      {/* User-Specific Permissions Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <Card className="lg:col-span-1">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
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
                          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                          ${isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white'
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
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                              </svg>
                              {user.totalScreensCount} screens
                            </span>
                            {user.additionalScreensCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
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
          </Card>

          {/* Screen Permissions for Selected User */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              {selectedUser ? (
                <>
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          Permissions for {selectedUser.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-2 ml-12">
                          Manage screen access for this employee. Default screens are automatically included.
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 ml-12 flex items-center gap-4 text-sm">
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

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {Object.entries(groupedScreens).map(([category, screens]) => {
                      const categoryScreens = screens.map(s => s._id);
                      const selectedInCategory = categoryScreens.filter(id => userScreenIds.includes(id)).length;

                      return (
                        <div key={category} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              {category}
                            </h3>
                            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                              {selectedInCategory}/{screens.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {screens.map(screen => {
                              const isDefault = defaultScreenIds.includes(screen._id);
                              const isSelected = userScreenIds.includes(screen._id);

                              return (
                                <label
                                  key={screen._id}
                                  className={`
                                    flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${isDefault
                                      ? 'bg-blue-50 border-2 border-blue-200'
                                      : isSelected
                                        ? 'bg-green-50 border-2 border-green-200'
                                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                                    }
                                  `}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleUserScreen(screen._id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-medium text-sm ${
                                        isDefault ? 'text-blue-900' : isSelected ? 'text-green-900' : 'text-gray-900'
                                      }`}>
                                        {screen.displayName}
                                      </span>
                                      {isDefault && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className={`text-xs mt-1 font-mono ${
                                      isDefault ? 'text-blue-600' : isSelected ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {screen.path}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleSaveUserPermissions}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:from-indigo-300 disabled:to-blue-300 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Permissions
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employee Selected</h3>
                  <p className="text-gray-500 max-w-sm">
                    Select an employee from the list on the left to view and manage their screen permissions.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

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
              {saving ? 'Initializing...' : 'Initialize'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Initialize Default Screens</p>
                <p className="text-sm text-blue-700 mt-1">
                  This will populate the screens list based on your current menu structure and application routes.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            Are you sure you want to initialize the screens? This will create entries for all available screens in the system.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ScreenPermissionsManagement;
