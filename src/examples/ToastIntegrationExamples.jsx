/**
 * Toast Integration Examples
 *
 * This file demonstrates how to integrate the Toast notification system
 * into various parts of your application.
 */

// ============================================================
// Example 1: Login Page Integration
// ============================================================

import { useToast } from '../hooks/useToast';

function LoginPage() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      await authService.login(credentials);
      showSuccess('Welcome back! Login successful.');
      // Navigate to dashboard
    } catch (error) {
      showError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (/* Login form JSX */);
}

// ============================================================
// Example 2: Inventory Management Integration
// ============================================================

function InventoryList() {
  const { showSuccess, showError, showWarning } = useToast();

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryService.deleteItem(itemId);
      showSuccess('Inventory item deleted successfully!');
      // Refresh list
    } catch (error) {
      showError('Failed to delete item. Please try again.');
    }
  };

  const handleStockUpdate = async (itemId, quantity) => {
    if (quantity < 10) {
      showWarning('Stock level is below minimum threshold!');
    }

    try {
      await inventoryService.updateStock(itemId, quantity);
      showSuccess('Stock quantity updated successfully!');
    } catch (error) {
      showError('Failed to update stock quantity.');
    }
  };

  return (/* Inventory list JSX */);
}

// ============================================================
// Example 3: Invoice Form Integration
// ============================================================

function InvoiceForm() {
  const { showSuccess, showError, showInfo } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (invoiceData) => {
    setSaving(true);
    try {
      const invoice = await invoiceService.create(invoiceData);
      showSuccess('Invoice created successfully!');
      showInfo(`Invoice #${invoice.invoiceNumber} has been saved.`, 5000);
      // Navigate to invoice detail or list
    } catch (error) {
      showError('Failed to create invoice. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDraft = async (invoiceData) => {
    try {
      await invoiceService.saveDraft(invoiceData);
      showInfo('Invoice saved as draft.');
    } catch (error) {
      showError('Failed to save draft.');
    }
  };

  return (/* Invoice form JSX */);
}

// ============================================================
// Example 4: User Management Integration
// ============================================================

function UserManagement() {
  const { showSuccess, showError, showWarning } = useToast();

  const handleCreateUser = async (userData) => {
    try {
      await userService.create(userData);
      showSuccess(`User "${userData.username}" created successfully!`);
      // Refresh user list
    } catch (error) {
      if (error.code === 'DUPLICATE_EMAIL') {
        showError('Email already exists. Please use a different email.');
      } else {
        showError('Failed to create user. Please try again.');
      }
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await userService.deactivate(userId);
      showWarning('User account has been deactivated.');
    } catch (error) {
      showError('Failed to deactivate user.');
    }
  };

  const handlePasswordReset = async (userId) => {
    try {
      await userService.resetPassword(userId);
      showSuccess('Password reset email sent successfully!');
    } catch (error) {
      showError('Failed to send password reset email.');
    }
  };

  return (/* User management JSX */);
}

// ============================================================
// Example 5: File Upload Integration
// ============================================================

function FileUpload() {
  const { showSuccess, showError, showInfo } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showError('File size exceeds 5MB limit.');
      return;
    }

    setUploading(true);
    showInfo('Uploading file...', 2000);

    try {
      const result = await uploadService.upload(file);
      showSuccess(`File "${file.name}" uploaded successfully!`, 5000);
    } catch (error) {
      showError('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (/* File upload JSX */);
}

// ============================================================
// Example 6: Bulk Operations Integration
// ============================================================

function BulkOperations() {
  const { showSuccess, showError, showInfo } = useToast();

  const handleBulkUpdate = async (items) => {
    showInfo(`Processing ${items.length} items...`, 3000);

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      try {
        await inventoryService.update(item.id, item.data);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    if (failCount === 0) {
      showSuccess(`All ${successCount} items updated successfully!`);
    } else if (successCount === 0) {
      showError('Failed to update any items. Please try again.');
    } else {
      showWarning(
        `${successCount} items updated, ${failCount} failed.`,
        6000
      );
    }
  };

  return (/* Bulk operations JSX */);
}

// ============================================================
// Example 7: API Error Handling Utility
// ============================================================

function useApiWithToast() {
  const { showError } = useToast();

  const handleApiCall = async (apiFunction, options = {}) => {
    const {
      successMessage,
      errorMessage = 'An error occurred. Please try again.',
      showLoading = false
    } = options;

    try {
      if (showLoading) {
        showInfo('Loading...', 2000);
      }

      const result = await apiFunction();

      if (successMessage) {
        showSuccess(successMessage);
      }

      return result;
    } catch (error) {
      const message = error.response?.data?.message || errorMessage;
      showError(message);
      throw error;
    }
  };

  return { handleApiCall };
}

// Usage:
function MyComponent() {
  const { handleApiCall } = useApiWithToast();

  const loadData = () => {
    handleApiCall(
      () => api.fetchData(),
      {
        successMessage: 'Data loaded successfully!',
        errorMessage: 'Failed to load data.',
        showLoading: true
      }
    );
  };
}

// ============================================================
// Example 8: Form Validation Integration
// ============================================================

function FormWithValidation() {
  const { showError, showWarning } = useToast();

  const validateForm = (formData) => {
    const errors = [];

    if (!formData.name) errors.push('Name is required');
    if (!formData.email) errors.push('Email is required');
    if (formData.email && !isValidEmail(formData.email)) {
      errors.push('Invalid email format');
    }

    if (errors.length > 0) {
      showError(errors.join('. '));
      return false;
    }

    if (formData.quantity < 10) {
      showWarning('Quantity is below recommended minimum.');
    }

    return true;
  };

  const handleSubmit = async (formData) => {
    if (!validateForm(formData)) {
      return;
    }

    // Proceed with submission
  };

  return (/* Form JSX */);
}

// ============================================================
// Example 9: Real-time Updates Integration
// ============================================================

function RealtimeNotifications() {
  const { showInfo, showWarning } = useToast();

  useEffect(() => {
    const socket = io();

    socket.on('low_stock', (data) => {
      showWarning(
        `Low stock alert: ${data.itemName} (${data.quantity} remaining)`,
        8000
      );
    });

    socket.on('new_order', (data) => {
      showInfo(`New order received: #${data.orderNumber}`, 5000);
    });

    return () => socket.disconnect();
  }, []);

  return (/* Component JSX */);
}

// ============================================================
// Example 10: Clipboard Operations
// ============================================================

function CopyToClipboard() {
  const { showSuccess, showError } = useToast();

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied to clipboard!', 2000);
    } catch (error) {
      showError('Failed to copy to clipboard.');
    }
  };

  return (
    <button onClick={() => handleCopy('example text')}>
      Copy
    </button>
  );
}

export {
  // Export all example components for reference
  LoginPage,
  InventoryList,
  InvoiceForm,
  UserManagement,
  FileUpload,
  BulkOperations,
  useApiWithToast,
  FormWithValidation,
  RealtimeNotifications,
  CopyToClipboard
};
