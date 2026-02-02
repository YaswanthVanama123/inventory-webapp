import { useState, useCallback, useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

/**
 * Custom hook for comprehensive error handling
 * Provides error state management, toast notifications, and error recovery
 */
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const toast = useContext(ToastContext);

  /**
   * Parse error response and extract user-friendly message
   */
  const parseError = useCallback((err) => {
    console.error('Error occurred:', err);

    // Default error message
    let message = 'An unexpected error occurred. Please try again.';
    let statusCode = null;

    // Handle Axios error responses
    if (err.response) {
      statusCode = err.response.status;

      // Extract error message from response
      if (err.response.data) {
        message = err.response.data.message ||
                 err.response.data.error ||
                 err.response.data.msg ||
                 message;
      }

      // Provide specific messages for common status codes
      switch (statusCode) {
        case 400:
          message = err.response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = err.response.data?.message || 'The requested resource was not found.';
          break;
        case 409:
          message = err.response.data?.message || 'A conflict occurred. The resource may already exist.';
          break;
        case 422:
          message = err.response.data?.message || 'Validation failed. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 502:
          message = 'Bad gateway. The server is temporarily unavailable.';
          break;
        case 503:
          message = 'Service unavailable. Please try again later.';
          break;
        case 504:
          message = 'Gateway timeout. The request took too long.';
          break;
        default:
          message = err.response.data?.message || message;
      }
    } else if (err.request) {
      // Request was made but no response received
      message = 'Network error. Please check your connection and try again.';
      statusCode = 0;
    } else if (err.message) {
      // Something else happened
      message = err.message;
    }

    return { message, statusCode };
  }, []);

  /**
   * Handle error with optional toast notification
   */
  const handleError = useCallback((err, options = {}) => {
    const {
      showToast = true,
      persistError = true,
      customMessage = null,
      onError = null,
    } = options;

    const { message, statusCode } = parseError(err);
    const finalMessage = customMessage || message;

    // Set error state if persistence is enabled
    if (persistError) {
      setError({ message: finalMessage, statusCode });
    }

    // Show toast notification if enabled
    if (showToast && toast) {
      toast.showError(finalMessage, 5000);
    }

    // Call custom error handler if provided
    if (onError) {
      onError({ message: finalMessage, statusCode, originalError: err });
    }

    // Handle authentication errors (401)
    if (statusCode === 401) {
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    return { message: finalMessage, statusCode };
  }, [parseError, toast]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrapper for async operations with automatic error handling
   */
  const executeAsync = useCallback(async (
    asyncFn,
    options = {}
  ) => {
    const {
      showToast = true,
      persistError = true,
      customErrorMessage = null,
      onSuccess = null,
      onError = null,
      finallyCallback = null,
    } = options;

    try {
      // Clear previous error
      if (persistError) {
        clearError();
      }

      // Execute async function
      const result = await asyncFn();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result, error: null };
    } catch (err) {
      // Handle error
      const errorInfo = handleError(err, {
        showToast,
        persistError,
        customMessage: customErrorMessage,
        onError,
      });

      return { success: false, data: null, error: errorInfo };
    } finally {
      // Call finally callback if provided
      if (finallyCallback) {
        finallyCallback();
      }
    }
  }, [handleError, clearError]);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((message, duration = 3000) => {
    if (toast) {
      toast.showSuccess(message, duration);
    }
  }, [toast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((message, duration = 3000) => {
    if (toast) {
      toast.showInfo(message, duration);
    }
  }, [toast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((message, duration = 4000) => {
    if (toast) {
      toast.showWarning(message, duration);
    }
  }, [toast]);

  return {
    error,
    setError,
    clearError,
    handleError,
    executeAsync,
    showSuccess,
    showInfo,
    showWarning,
    parseError,
  };
};

export default useErrorHandler;
