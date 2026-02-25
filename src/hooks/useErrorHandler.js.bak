import { useState, useCallback, useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';


const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const toast = useContext(ToastContext);

  
  const parseError = useCallback((err) => {
    console.error('Error occurred:', err);

    
    let message = 'An unexpected error occurred. Please try again.';
    let statusCode = null;

    
    if (err.response) {
      statusCode = err.response.status;

      
      if (err.response.data) {
        message = err.response.data.message ||
                 err.response.data.error ||
                 err.response.data.msg ||
                 message;
      }

      
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
      
      message = 'Network error. Please check your connection and try again.';
      statusCode = 0;
    } else if (err.message) {
      
      message = err.message;
    }

    return { message, statusCode };
  }, []);

  
  const handleError = useCallback((err, options = {}) => {
    const {
      showToast = true,
      persistError = true,
      customMessage = null,
      onError = null,
    } = options;

    const { message, statusCode } = parseError(err);
    const finalMessage = customMessage || message;

    
    if (persistError) {
      setError({ message: finalMessage, statusCode });
    }

    
    if (showToast && toast) {
      toast.showError(finalMessage, 5000);
    }

    
    if (onError) {
      onError({ message: finalMessage, statusCode, originalError: err });
    }

    
    if (statusCode === 401) {
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    return { message: finalMessage, statusCode };
  }, [parseError, toast]);

  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  
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
      
      if (persistError) {
        clearError();
      }

      
      const result = await asyncFn();

      
      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result, error: null };
    } catch (err) {
      
      const errorInfo = handleError(err, {
        showToast,
        persistError,
        customMessage: customErrorMessage,
        onError,
      });

      return { success: false, data: null, error: errorInfo };
    } finally {
      
      if (finallyCallback) {
        finallyCallback();
      }
    }
  }, [handleError, clearError]);

  
  const showSuccess = useCallback((message, duration = 3000) => {
    if (toast) {
      toast.showSuccess(message, duration);
    }
  }, [toast]);

  
  const showInfo = useCallback((message, duration = 3000) => {
    if (toast) {
      toast.showInfo(message, duration);
    }
  }, [toast]);

  
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
