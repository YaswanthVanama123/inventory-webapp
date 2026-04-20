import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { ToastContext } from '../../contexts/ToastContext';
import userService from '../../services/userService';
import screenPermissionService from '../../services/screenPermissionService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showSuccess, showError, showInfo } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: '',
    truckNumber: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });
  const [allScreens, setAllScreens] = useState([]);
  const [defaultScreens, setDefaultScreens] = useState([]);
  const [selectedScreenIds, setSelectedScreenIds] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);
  useEffect(() => {
    fetchScreens();
    if (isEditMode) {
      fetchUser();
      fetchUserPermissions();
    }
  }, [id, isEditMode]);

  // Fetch permissions when role changes to employee for new users
  useEffect(() => {
    if (!isEditMode && formData.role === 'employee' && allScreens.length === 0) {
      fetchScreens();
    }
  }, [formData.role, isEditMode]);

  const fetchScreens = async () => {
    try {
      const [screensResponse, defaultResponse] = await Promise.all([
        screenPermissionService.getAllScreens(),
        screenPermissionService.getDefaultScreens()
      ]);

      if (screensResponse.success) {
        setAllScreens(screensResponse.data || []);
      }

      if (defaultResponse.success) {
        setDefaultScreens(defaultResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching screens:', err);
    }
  };

  const fetchUserPermissions = async () => {
    if (!id) return;

    setLoadingScreens(true);
    try {
      const response = await screenPermissionService.getUserSpecificPermissions(id);
      if (response.success) {
        // Get the IDs of screens this user has access to (beyond defaults)
        const screenIds = response.data.map(screen => screen._id);
        setSelectedScreenIds(screenIds);
      }
    } catch (err) {
      console.error('Error fetching user permissions:', err);
    } finally {
      setLoadingScreens(false);
    }
  };
  const fetchUser = async () => {
    setFetchLoading(true);
    try {
      const response = await userService.getById(id);
      const user = response.data.user;
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        password: '',
        confirmPassword: '',
        role: user.role || '',
        truckNumber: user.truckNumber || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setAlert({
        type: 'danger',
        message: 'Failed to load user data. Please try again.',
      });
    } finally {
      setFetchLoading(false);
    }
  };
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    let label = '';
    let color = '';
    if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      label = 'Medium';
      color = 'bg-yellow-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }
    return { score, label, color };
  };
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Reset screen permissions if role is changed to admin
    if (name === 'role' && value === 'admin') {
      setSelectedScreenIds([]);
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must not exceed 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format (e.g., user@example.com)';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name must not exceed 50 characters';
    }
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (formData.password.length > 100) {
        newErrors.password = 'Password must not exceed 100 characters';
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (formData.password.length > 100) {
        newErrors.password = 'Password must not exceed 100 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreenToggle = (screenId) => {
    setSelectedScreenIds(prev => {
      if (prev.includes(screenId)) {
        return prev.filter(id => id !== screenId);
      } else {
        return [...prev, screenId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    if (!validateForm()) {
      showError('Please fix the errors in the form before submitting');
      setAlert({
        type: 'danger',
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        isActive: formData.isActive,
        truckNumber: formData.truckNumber || null,
      };
      if (!isEditMode || formData.password) {
        payload.password = formData.password;
      }

      const response = isEditMode
        ? await userService.update(id, payload)
        : await userService.create(payload);

      // Save screen permissions for employees
      if (formData.role === 'employee') {
        try {
          const userId = isEditMode ? id : response.data.user._id;
          await screenPermissionService.updateUserPermissions(userId, selectedScreenIds);
        } catch (permErr) {
          console.error('Error saving screen permissions:', permErr);
          showError('User saved but screen permissions update failed');
        }
      }

      const successMessage = `User ${isEditMode ? 'updated' : 'created'} successfully!`;
      showSuccess(successMessage);
      setAlert({
        type: 'success',
        message: successMessage,
      });
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.message || 'Failed to save user. Please try again.';
      showError(errorMessage);
      setAlert({
        type: 'danger',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    navigate('/users');
  };
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode
              ? 'Update user information and permissions'
              : 'Create a new user account with appropriate role and permissions'}
          </p>
        </div>
        {}
        {alert && (
          <div className="mb-6">
            <Alert
              variant={alert.type}
              dismissible
              onDismiss={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </div>
        )}
        {}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {}
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            error={errors.username}
            required
            fullWidth
            icon={<User className="w-5 h-5" />}
            disabled={loading}
            helperText={isEditMode ? "Username cannot be changed" : "3+ characters, letters, numbers, and underscores only"}
            readOnly={isEditMode}
          />
          {}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            error={errors.email}
            required
            fullWidth
            icon={<Mail className="w-5 h-5" />}
            disabled={loading}
            helperText="Valid email address required"
          />
          {}
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            error={errors.fullName}
            required
            fullWidth
            icon={<User className="w-5 h-5" />}
            disabled={loading}
          />
          {}
          <div>
            {isEditMode && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Admin Password Reset</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      As an admin, you can reset this employee's password. Enter a new password below, or leave blank to keep the current password.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter password'}
                error={errors.password}
                required={!isEditMode}
                fullWidth
                icon={<Lock className="w-5 h-5" />}
                disabled={loading}
                helperText={isEditMode ? "Leave blank to keep current password - As admin, you can reset without knowing the current password" : "Minimum 8 characters with uppercase, lowercase, and numbers"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.label === 'Weak' ? 'text-red-600' :
                    passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    {formData.password.length >= 8 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                      Uppercase and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {/[0-9]/.test(formData.password) ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                      Contains numbers
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {/[^a-zA-Z0-9]/.test(formData.password) ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                      Special characters (recommended)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {}
          <div>
            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={isEditMode ? 'Confirm new password (if changing)' : 'Re-enter password'}
                error={errors.confirmPassword}
                required={!isEditMode || formData.password !== ''}
                fullWidth
                icon={<Lock className="w-5 h-5" />}
                disabled={loading}
                helperText={isEditMode ? "Required only if changing password" : "Must match password above"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {}
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'employee', label: 'Employee' },
            ]}
            placeholder="Select user role"
            error={errors.role}
            required
            fullWidth
            disabled={loading}
            helperText="Admin has full access, Employee has limited access"
          />
          {}
          <Input
            label="Truck Number"
            name="truckNumber"
            type="text"
            value={formData.truckNumber}
            onChange={handleChange}
            placeholder="e.g., NRV01, TRUCK01"
            error={errors.truckNumber}
            fullWidth
            disabled={loading}
            helperText="Unique truck/vehicle identifier for this employee (appears in Class column of invoices)"
            style={{ textTransform: 'uppercase' }}
          />
          {/* Screen Permissions - Only show for employees */}
          {formData.role === 'employee' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Screen Permissions</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Select additional screens this employee can access. Default screens are automatically included for all employees.
              </p>

              {loadingScreens ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading screens...</div>
              ) : (
                <div className="space-y-4">
                  {/* Default Screens (Read-only) */}
                  {defaultScreens.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Default Screens (Always Included)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {defaultScreens.map(screen => (
                          <div
                            key={screen._id}
                            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>{screen.displayName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Screens (Selectable) */}
                  {allScreens.filter(screen => !screen.isDefault).length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Additional Screens (Optional)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {allScreens
                          .filter(screen => !screen.isDefault)
                          .sort((a, b) => a.displayName.localeCompare(b.displayName))
                          .map(screen => (
                            <label
                              key={screen._id}
                              className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer transition-colors ${
                                selectedScreenIds.includes(screen._id)
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedScreenIds.includes(screen._id)}
                                onChange={() => handleScreenToggle(screen._id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                disabled={loading}
                              />
                              <span className="text-xs">{screen.displayName}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Active Status Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Active Status
              </label>
              <p className="text-xs text-gray-500">
                {formData.isActive ? 'User can log in and access the system' : 'User account is disabled'}
              </p>
            </div>
          </div>
          {}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              fullWidth
              className="sm:w-auto sm:min-w-[150px]"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
        {}
        {isEditMode && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">Admin Password Reset Enabled</h3>
                <p className="text-sm text-green-700 mt-1">
                  You can reset this employee's password without knowing their current password.
                  Simply enter a new password above and click "Update User". The employee can use the new password immediately after the update.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserForm;
