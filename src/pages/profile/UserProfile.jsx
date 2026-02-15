import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';


const UserProfile = () => {
  const { user, changePassword, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  
  useEffect(() => {
    const password = passwordForm.newPassword;
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
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

    setPasswordStrength({ score, label, color });
  }, [passwordForm.newPassword]);

  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  
  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'danger', text: 'Please fill in all password fields' });
      return false;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'danger', text: 'New password must be at least 8 characters long' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'New passwords do not match' });
      return false;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'danger', text: 'New password must be different from current password' });
      return false;
    }

    return true;
  };

  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validatePasswordForm()) {
      return;
    }

    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Password changed successfully' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      setMessage({ type: 'danger', text: result.error || 'Failed to change password' });
    }
  };

  
  const handlePreferencesSave = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setMessage({ type: 'success', text: 'Preferences saved successfully' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to save preferences' });
    }
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'U';
  };

  
  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: '👤' },
    { id: 'password', label: 'Change Password', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      {}
      {message.text && (
        <Alert variant={message.type} dismissible onDismiss={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {}
        <div className="border-b border-slate-200 bg-slate-50">
          <nav className="flex flex-col sm:flex-row -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {}
        <div className="p-6 sm:p-8">
          {}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-200">
                {}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getUserInitials()}
                </div>

                {}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{user?.fullName || user?.username}</h2>
                  <p className="text-slate-600 mt-1">{user?.email}</p>
                  <div className="mt-2">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${user?.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                  <p className="text-lg font-semibold text-slate-900">{user?.username || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <p className="text-lg font-semibold text-slate-900">{user?.email || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <p className="text-lg font-semibold text-slate-900">{user?.fullName || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                  <p className="text-lg font-semibold text-slate-900 capitalize">{user?.role || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Last Login</label>
                  <p className="text-lg font-semibold text-slate-900">{formatDate(user?.lastLogin)}</p>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'password' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Change Password</h3>
                <p className="text-slate-600">Update your password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                  fullWidth
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  fullWidth
                  helperText="Password must be at least 8 characters long"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  }
                />

                {}
                {passwordForm.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Password Strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score <= 2 ? 'text-red-600' :
                        passwordStrength.score <= 4 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 mt-2">
                      <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                        ✓ At least 8 characters
                      </li>
                      <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        ✓ Contains lowercase letter
                      </li>
                      <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        ✓ Contains uppercase letter
                      </li>
                      <li className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        ✓ Contains number
                      </li>
                      <li className={/[^a-zA-Z0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                        ✓ Contains special character
                      </li>
                    </ul>
                  </div>
                )}

                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  required
                  fullWidth
                  error={
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    disabled={
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className="flex-1 sm:flex-initial"
                  >
                    Change Password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                      setMessage({ type: '', text: '' });
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {}
          {activeTab === 'preferences' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Preferences</h3>
                <p className="text-slate-600">Customize your application experience</p>
              </div>

              <form onSubmit={handlePreferencesSave} className="space-y-6">
                {}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-slate-900 block">
                      Email Notifications
                    </label>
                    <p className="text-sm text-slate-600 mt-1">
                      Receive email notifications about important updates
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPreferences(prev => ({
                          ...prev,
                          emailNotifications: !prev.emailNotifications
                        }));
                      }}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${preferences.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'}
                      `}
                      role="switch"
                      aria-checked={preferences.emailNotifications}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <label htmlFor="language" className="block text-sm font-medium text-slate-700">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={preferences.language}
                    onChange={handlePreferencesChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                {}
                <div className="space-y-2">
                  <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={preferences.timezone}
                    onChange={handlePreferencesChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Europe/Berlin">Berlin (CET)</option>
                    <option value="Europe/Moscow">Moscow (MSK)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Shanghai">China (CST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 sm:flex-initial"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      const savedPreferences = localStorage.getItem('userPreferences');
                      if (savedPreferences) {
                        setPreferences(JSON.parse(savedPreferences));
                      }
                      setMessage({ type: '', text: '' });
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
