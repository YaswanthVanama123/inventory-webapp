import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, 
});


const activeRequests = new Map();


const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, 
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED'],
};


const ERROR_MESSAGES = {
  
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',

  
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This operation conflicts with existing data.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please slow down and try again later.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Gateway timeout. The server took too long to respond.',

  
  DEFAULT: 'An unexpected error occurred. Please try again.',
};


api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('authToken');

    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }

    
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    
    const requestKey = `${config.method}-${config.url}`;
    activeRequests.set(requestKey, source);

    
    config.retryCount = config.retryCount || 0;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    
    const requestKey = `${response.config.method}-${response.config.url}`;
    activeRequests.delete(requestKey);

    
    return response.data;
  },
  async (error) => {
    const config = error.config;

    
    if (config) {
      const requestKey = `${config.method}-${config.url}`;
      activeRequests.delete(requestKey);
    }

    
    if (axios.isCancel(error)) {
      return Promise.reject({
        message: 'Request was cancelled',
        code: 'REQUEST_CANCELLED',
        cancelled: true,
      });
    }

    
    if (config && shouldRetry(error, config)) {
      config.retryCount += 1;

      
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, config.retryCount - 1);

      console.log(`Retrying request (${config.retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`);

      
      await new Promise(resolve => setTimeout(resolve, delay));

      
      return api(config);
    }

    
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          
          handleValidationError(data);
          break;

        case 401:
          
          handleUnauthorized(data);
          break;

        case 403:
          
          handleForbidden(data);
          break;

        case 404:
          
          handleNotFound(data);
          break;

        case 409:
          
          handleConflict(data);
          break;

        case 422:
          
          handleValidationError(data);
          break;

        case 429:
          
          handleRateLimitExceeded(data);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          
          handleServerError(data, status);
          break;

        default:
          break;
      }

      
      return Promise.reject(formatError(error));
    } else if (error.request) {
      
      return Promise.reject(handleNetworkError(error));
    } else if (error.code === 'ECONNABORTED') {
      
      return Promise.reject(handleTimeoutError(error));
    } else {
      
      return Promise.reject({
        message: error.message || ERROR_MESSAGES.DEFAULT,
        code: 'REQUEST_ERROR',
        originalError: error,
        userMessage: ERROR_MESSAGES.DEFAULT,
      });
    }
  }
);


const shouldRetry = (error, config) => {
  
  if (config.retryCount >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  
  if (config.retry === false) {
    return false;
  }

  
  if (axios.isCancel(error)) {
    return false;
  }

  
  if (!error.response && error.code) {
    return RETRY_CONFIG.retryableErrors.includes(error.code);
  }

  
  if (error.response) {
    return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
  }

  return false;
};


const handleValidationError = (data) => {
  console.error('Validation error:', data?.error?.message || 'Invalid request');

  
  if (data?.error?.details) {
    console.error('Validation details:', data.error.details);
  }
};


const handleUnauthorized = (data) => {
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }

  console.error('Unauthorized:', data?.error?.message || 'Session expired');
};


const handleForbidden = (data) => {
  console.error('Forbidden:', data?.error?.message || 'Insufficient permissions');
};


const handleNotFound = (data) => {
  console.error('Not found:', data?.error?.message || 'Resource not found');
};


const handleConflict = (data) => {
  console.error('Conflict:', data?.error?.message || 'Resource conflict');
};


const handleRateLimitExceeded = (data) => {
  const retryAfter = data?.error?.retryAfter || 60;
  console.error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
};


const handleServerError = (data, status) => {
  console.error(`Server error (${status}):`, data?.error?.message || 'Internal server error');
};


const handleNetworkError = (error) => {
  console.error('Network error:', error.message);

  return {
    message: 'Network error occurred',
    code: 'NETWORK_ERROR',
    originalError: error,
    userMessage: ERROR_MESSAGES.NETWORK_ERROR,
    retry: true,
  };
};


const handleTimeoutError = (error) => {
  console.error('Request timeout:', error.message);

  return {
    message: 'Request timeout',
    code: 'TIMEOUT_ERROR',
    originalError: error,
    userMessage: ERROR_MESSAGES.TIMEOUT_ERROR,
    retry: true,
  };
};


const formatError = (error) => {
  const { response } = error;

  if (response && response.data) {
    const status = response.status;
    const errorData = response.data.error || {};

    
    const backendMessage = errorData.message || response.data.message;
    const userMessage = ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT;

    
    return {
      message: backendMessage || userMessage,
      code: errorData.code || `HTTP_${status}`,
      field: errorData.field,
      details: errorData.details,
      status: status,
      originalError: error,
      userMessage: userMessage,
      
      validationErrors: errorData.details || null,
    };
  }

  
  return {
    message: error.message || ERROR_MESSAGES.DEFAULT,
    code: 'UNKNOWN_ERROR',
    originalError: error,
    userMessage: ERROR_MESSAGES.DEFAULT,
  };
};


export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};


export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};


export const isAuthenticated = () => {
  return !!getAuthToken();
};


export const cancelAllRequests = (message = 'Operation cancelled') => {
  activeRequests.forEach((source) => {
    source.cancel(message);
  });
  activeRequests.clear();
};


export const cancelRequest = (method, url, message = 'Operation cancelled') => {
  const requestKey = `${method}-${url}`;
  const source = activeRequests.get(requestKey);
  if (source) {
    source.cancel(message);
    activeRequests.delete(requestKey);
  }
};


export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.DEFAULT;

  
  if (error.userMessage) {
    return error.userMessage;
  }

  
  if (error.status && ERROR_MESSAGES[error.status]) {
    return ERROR_MESSAGES[error.status];
  }

  
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  
  return error.message || ERROR_MESSAGES.DEFAULT;
};


export const isErrorType = (error, type) => {
  if (!error) return false;

  switch (type) {
    case 'network':
      return error.code === 'NETWORK_ERROR' || !error.status;
    case 'timeout':
      return error.code === 'TIMEOUT_ERROR' || error.code === 'ECONNABORTED';
    case 'auth':
      return error.status === 401 || error.code === 'UNAUTHORIZED';
    case 'permission':
      return error.status === 403 || error.code === 'FORBIDDEN';
    case 'validation':
      return error.status === 400 || error.status === 422 || error.validationErrors;
    case 'notfound':
      return error.status === 404;
    case 'conflict':
      return error.status === 409;
    case 'server':
      return error.status >= 500;
    default:
      return false;
  }
};

export default api;
