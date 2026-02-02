import { getErrorMessage, isErrorType } from './api';




export const handleApiError = (error, customMessages = {}) => {
  
  if (isErrorType(error, 'validation')) {
    return {
      ...error,
      userMessage: customMessages.validation ||
        error.validationErrors ||
        'Please check your input and try again.',
    };
  }

  
  if (isErrorType(error, 'auth')) {
    return {
      ...error,
      userMessage: customMessages.auth ||
        'Your session has expired. Please log in again.',
    };
  }

  
  if (isErrorType(error, 'permission')) {
    return {
      ...error,
      userMessage: customMessages.permission ||
        'You do not have permission to perform this action.',
    };
  }

  
  if (isErrorType(error, 'notfound')) {
    return {
      ...error,
      userMessage: customMessages.notfound ||
        'The requested resource was not found.',
    };
  }

  
  if (isErrorType(error, 'conflict')) {
    return {
      ...error,
      userMessage: customMessages.conflict ||
        error.message ||
        'This operation conflicts with existing data.',
    };
  }

  
  if (isErrorType(error, 'network')) {
    return {
      ...error,
      userMessage: customMessages.network ||
        'Unable to connect to the server. Please check your internet connection.',
    };
  }

  
  if (isErrorType(error, 'timeout')) {
    return {
      ...error,
      userMessage: customMessages.timeout ||
        'The request took too long. Please try again.',
    };
  }

  
  if (isErrorType(error, 'server')) {
    return {
      ...error,
      userMessage: customMessages.server ||
        'A server error occurred. Please try again later.',
    };
  }

  
  return {
    ...error,
    userMessage: customMessages.default || getErrorMessage(error),
  };
};


export const withErrorHandling = (serviceMethod, customMessages = {}) => {
  return async (...args) => {
    try {
      return await serviceMethod(...args);
    } catch (error) {
      throw handleApiError(error, customMessages);
    }
  };
};


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


export const shouldRetry = (error) => {
  if (!error) return false;

  return isErrorType(error, 'network') ||
         isErrorType(error, 'timeout') ||
         isErrorType(error, 'server') ||
         error.retry === true;
};
