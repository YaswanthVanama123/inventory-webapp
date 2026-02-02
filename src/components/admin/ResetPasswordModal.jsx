import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';

const API_BASE_URL = 'http://localhost:5000/api';

const ResetPasswordModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setAlert(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [isOpen]);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
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

  // Update password strength when password changes
  useEffect(() => {
    if (formData.newPassword) {
      const strength = calculatePasswordStrength(formData.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.newPassword]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear alert
    if (alert) {
      setAlert(null);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      setAlert({
        type: 'danger',
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to reset password');
      }

      setAlert({
        type: 'success',
        message: 'Password reset successfully!',
      });

      // Close modal after a short delay
      setTimeout(() => {
        onClose(true); // Pass true to indicate success
      }, 1500);
    } catch (err) {
      console.error('Error resetting password:', err);
      setAlert({
        type: 'danger',
        message: err.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const modalFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onClose(false)}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Reset User Password"
      footer={modalFooter}
      size="md"
      closeOnOverlayClick={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Resetting password for: <span className="font-semibold">{user?.fullName || user?.username}</span>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            {user?.email}
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            variant={alert.type}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        {/* New Password */}
        <div>
          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              error={errors.newPassword}
              required
              fullWidth
              icon={<Lock className="w-5 h-5" />}
              disabled={loading}
              helperText="Minimum 8 characters with uppercase, lowercase, and numbers"
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

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-3">
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
                  {formData.newPassword.length >= 8 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    Uppercase and lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[0-9]/.test(formData.newPassword) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    Contains numbers
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {/[^a-zA-Z0-9]/.test(formData.newPassword) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                    Special characters (recommended)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            error={errors.confirmPassword}
            required
            fullWidth
            icon={<Lock className="w-5 h-5" />}
            disabled={loading}
            helperText="Re-enter the new password"
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

        {/* Password Match Indicator */}
        {formData.confirmPassword && (
          <div className="flex items-center gap-2 text-sm">
            {formData.newPassword === formData.confirmPassword ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900">Security Notice</h4>
              <p className="text-xs text-yellow-700 mt-1">
                The user will be required to log in with the new password. Make sure to communicate
                the new password securely.
              </p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

ResetPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    fullName: PropTypes.string,
  }),
};

export default ResetPasswordModal;
