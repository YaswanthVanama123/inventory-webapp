import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Store for active requests (for cancellation)
const activeRequests = new Map();

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED'],
};

// Error message mapping for common errors
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',

  // HTTP status codes
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

  // Default
  DEFAULT: 'An unexpected error occurred. Please try again.',
};

// Request interceptor - Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type if it's already set (for multipart/form-data)
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }

    // Create cancel token for this request
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    // Store cancel token with a unique key
    const requestKey = `${config.method}-${config.url}`;
    activeRequests.set(requestKey, source);

    // Initialize retry count
    config.retryCount = config.retryCount || 0;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and authentication with retry logic
api.interceptors.response.use(
  (response) => {
    // Remove from active requests
    const requestKey = `${response.config.method}-${response.config.url}`;
    activeRequests.delete(requestKey);

    // Return the data object directly for successful responses
    return response.data;
  },
  async (error) => {
    const config = error.config;

    // Remove from active requests
    if (config) {
      const requestKey = `${config.method}-${config.url}`;
      activeRequests.delete(requestKey);
    }

    // Check if request was cancelled
    if (axios.isCancel(error)) {
      return Promise.reject({
        message: 'Request was cancelled',
        code: 'REQUEST_CANCELLED',
        cancelled: true,
      });
    }

    // Determine if request should be retried
    if (config && shouldRetry(error, config)) {
      config.retryCount += 1;

      // Calculate delay with exponential backoff
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, config.retryCount - 1);

      console.log(`Retrying request (${config.retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the request
      return api(config);
    }

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Bad Request - Validation errors
          handleValidationError(data);
          break;

        case 401:
          // Unauthorized - Token expired or invalid
          handleUnauthorized(data);
          break;

        case 403:
          // Forbidden - Insufficient permissions
          handleForbidden(data);
          break;

        case 404:
          // Not Found
          handleNotFound(data);
          break;

        case 409:
          // Conflict (e.g., duplicate SKU)
          handleConflict(data);
          break;

        case 422:
          // Validation errors
          handleValidationError(data);
          break;

        case 429:
          // Rate limit exceeded
          handleRateLimitExceeded(data);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          handleServerError(data, status);
          break;

        default:
          break;
      }

      // Format and reject with standardized error
      return Promise.reject(formatError(error));
    } else if (error.request) {
      // Request was made but no response received - Network error
      return Promise.reject(handleNetworkError(error));
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      return Promise.reject(handleTimeoutError(error));
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        message: error.message || ERROR_MESSAGES.DEFAULT,
        code: 'REQUEST_ERROR',
        originalError: error,
        userMessage: ERROR_MESSAGES.DEFAULT,
      });
    }
  }
);

// Determine if request should be retried
const shouldRetry = (error, config) => {
  // Don't retry if max retries reached
  if (config.retryCount >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  // Don't retry if retry is explicitly disabled
  if (config.retry === false) {
    return false;
  }

  // Don't retry cancelled requests
  if (axios.isCancel(error)) {
    return false;
  }

  // Retry on network errors
  if (!error.response && error.code) {
    return RETRY_CONFIG.retryableErrors.includes(error.code);
  }

  // Retry on specific HTTP status codes
  if (error.response) {
    return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
  }

  return false;
};

// Handle 400 Bad Request - Validation errors
const handleValidationError = (data) => {
  console.error('Validation error:', data?.error?.message || 'Invalid request');

  // Log validation details if available
  if (data?.error?.details) {
    console.error('Validation details:', data.error.details);
  }
};

// Handle 401 Unauthorized
const handleUnauthorized = (data) => {
  // Clear token and user data
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }

  console.error('Unauthorized:', data?.error?.message || 'Session expired');
};

// Handle 403 Forbidden
const handleForbidden = (data) => {
  console.error('Forbidden:', data?.error?.message || 'Insufficient permissions');
};

// Handle 404 Not Found
const handleNotFound = (data) => {
  console.error('Not found:', data?.error?.message || 'Resource not found');
};

// Handle 409 Conflict
const handleConflict = (data) => {
  console.error('Conflict:', data?.error?.message || 'Resource conflict');
};

// Handle 429 Rate Limit Exceeded
const handleRateLimitExceeded = (data) => {
  const retryAfter = data?.error?.retryAfter || 60;
  console.error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
};

// Handle 500+ Server Errors
const handleServerError = (data, status) => {
  console.error(`Server error (${status}):`, data?.error?.message || 'Internal server error');
};

// Handle network errors
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

// Handle timeout errors
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

// Format error for consistent error handling
const formatError = (error) => {
  const { response } = error;

  if (response && response.data) {
    const status = response.status;
    const errorData = response.data.error || {};

    // Extract error message from various possible formats
    const backendMessage = errorData.message || response.data.message;
    const userMessage = ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT;

    // API returned an error response
    return {
      message: backendMessage || userMessage,
      code: errorData.code || `HTTP_${status}`,
      field: errorData.field,
      details: errorData.details,
      status: status,
      originalError: error,
      userMessage: userMessage,
      // Include validation errors if present
      validationErrors: errorData.details || null,
    };
  }

  // Generic error
  return {
    message: error.message || ERROR_MESSAGES.DEFAULT,
    code: 'UNKNOWN_ERROR',
    originalError: error,
    userMessage: ERROR_MESSAGES.DEFAULT,
  };
};

// Helper function to set authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Helper function to get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function to cancel all active requests
export const cancelAllRequests = (message = 'Operation cancelled') => {
  activeRequests.forEach((source) => {
    source.cancel(message);
  });
  activeRequests.clear();
};

// Helper function to cancel specific request
export const cancelRequest = (method, url, message = 'Operation cancelled') => {
  const requestKey = `${method}-${url}`;
  const source = activeRequests.get(requestKey);
  if (source) {
    source.cancel(message);
    activeRequests.delete(requestKey);
  }
};

// Helper function to get user-friendly error message
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.DEFAULT;

  // If error has userMessage property, use it
  if (error.userMessage) {
    return error.userMessage;
  }

  // If error has status, get message from mapping
  if (error.status && ERROR_MESSAGES[error.status]) {
    return ERROR_MESSAGES[error.status];
  }

  // If error has code, check if it's a known code
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Otherwise return the error message or default
  return error.message || ERROR_MESSAGES.DEFAULT;
};

// Helper function to check if error is a specific type
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
