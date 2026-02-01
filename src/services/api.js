import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor - Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type if it's already set (for multipart/form-data)
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and authentication
api.interceptors.response.use(
  (response) => {
    // Return the data object directly for successful responses
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
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
          break;

        case 409:
          // Conflict (e.g., duplicate SKU)
          break;

        case 422:
          // Validation errors
          break;

        case 429:
          // Rate limit exceeded
          handleRateLimitExceeded(data);
          break;

        case 500:
          // Internal server error
          handleServerError(data);
          break;

        default:
          break;
      }

      // Format and reject with standardized error
      return Promise.reject(formatError(error));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
        originalError: error,
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR',
        originalError: error,
      });
    }
  }
);

// Handle 401 Unauthorized
const handleUnauthorized = (data) => {
  // Clear token and user data
  localStorage.removeItem('token');
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

  // Optionally show a notification to the user
  // You can integrate with your notification system here
};

// Handle 429 Rate Limit Exceeded
const handleRateLimitExceeded = (data) => {
  const retryAfter = data?.error?.retryAfter || 900;
  console.error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);

  // Optionally show a notification to the user
};

// Handle 500 Server Error
const handleServerError = (data) => {
  console.error('Server error:', data?.error?.message || 'Internal server error');

  // Optionally show a notification to the user
};

// Format error for consistent error handling
const formatError = (error) => {
  const { response } = error;

  if (response && response.data) {
    // API returned an error response
    return {
      message: response.data.error?.message || 'An error occurred',
      code: response.data.error?.code || 'UNKNOWN_ERROR',
      field: response.data.error?.field,
      status: response.status,
      originalError: error,
    };
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    originalError: error,
  };
};

// Helper function to set authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper function to get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;
