import { getErrorMessage, isErrorType } from './api';

/**
 * Error Handler Utility
 * Provides consistent error handling across all services
 */

/**
 * Handle API errors with specific status code handling
 * @param {Object} error - The error object from API
 * @param {Object} customMessages - Custom error messages for specific cases
 * @returns {Object} Formatted error with user-friendly message
 */
export const handleApiError = (error, customMessages = {}) => {
  // Handle validation errors (400, 422)
  if (isErrorType(error, 'validation')) {
    return {
      ...error,
      userMessage: customMessages.validation ||
        error.validationErrors ||
        'Please check your input and try again.',
    };
  }

  // Handle authentication errors (401)
  if (isErrorType(error, 'auth')) {
    return {
      ...error,
      userMessage: customMessages.auth ||
        'Your session has expired. Please log in again.',
    };
  }

  // Handle permission errors (403)
  if (isErrorType(error, 'permission')) {
    return {
      ...error,
      userMessage: customMessages.permission ||
        'You do not have permission to perform this action.',
    };
  }

  // Handle not found errors (404)
  if (isErrorType(error, 'notfound')) {
    return {
      ...error,
      userMessage: customMessages.notfound ||
        'The requested resource was not found.',
    };
  }

  // Handle conflict errors (409)
  if (isErrorType(error, 'conflict')) {
    return {
      ...error,
      userMessage: customMessages.conflict ||
        error.message ||
        'This operation conflicts with existing data.',
    };
  }

  // Handle network errors
  if (isErrorType(error, 'network')) {
    return {
      ...error,
      userMessage: customMessages.network ||
        'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // Handle timeout errors
  if (isErrorType(error, 'timeout')) {
    return {
      ...error,
      userMessage: customMessages.timeout ||
        'The request took too long. Please try again.',
    };
  }

  // Handle server errors (500+)
  if (isErrorType(error, 'server')) {
    return {
      ...error,
      userMessage: customMessages.server ||
        'A server error occurred. Please try again later.',
    };
  }

  // Default error handling
  return {
    ...error,
    userMessage: customMessages.default || getErrorMessage(error),
  };
};

/**
 * Wrapper for service methods with automatic error handling
 * @param {Function} serviceMethod - The service method to wrap
 * @param {Object} customMessages - Custom error messages
 * @returns {Function} Wrapped method with error handling
 */
export const withErrorHandling = (serviceMethod, customMessages = {}) => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      throw handleApiError(error, customMessages);
    }
  };
};

/**
 * Extract validation errors from error object
 * @param {Object} error - The error object
 * @returns {Object|null} Validation errors object or null
 */
export const getValidationErrors = (error) => {
  if (!error) return null;

  if (error.validationErrors) {
    return error.validationErrors;
  }

  if (error.details && typeof error.details === 'object') {
    return error.details;
  }

  return null;
};

/**
 * Check if error should show retry option
 * @param {Object} error - The error object
 * @returns {boolean} True if retry is recommended
 */
export const shouldRetry = (error) => {
  if (!error) return false;

  return isErrorType(error, 'network') ||
         isErrorType(error, 'timeout') ||
         isErrorType(error, 'server') ||
         error.retry === true;
};
