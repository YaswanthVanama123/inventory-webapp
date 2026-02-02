/**
 * Error Reporting Utilities
 *
 * Functions for logging and reporting errors to external services
 * or internal logging systems.
 */

/**
 * Log error to console with enhanced formatting
 * @param {Error} error - The error object
 * @param {Object} errorInfo - React error info with component stack
 * @param {Object} context - Additional context information
 */
export const logErrorToConsole = (error, errorInfo, context = {}) => {
  console.group('%c Error Occurred ', 'background: #ef4444; color: white; padding: 2px 8px; border-radius: 3px;');

  console.error('Error:', error);
  console.error('Error Message:', error.message);
  console.error('Stack Trace:', error.stack);

  if (errorInfo && errorInfo.componentStack) {
    console.error('Component Stack:', errorInfo.componentStack);
  }

  if (Object.keys(context).length > 0) {
    console.error('Additional Context:', context);
  }

  console.error('Timestamp:', new Date().toISOString());
  console.error('User Agent:', navigator.userAgent);
  console.error('URL:', window.location.href);

  console.groupEnd();
};

/**
 * Report error to external service (e.g., Sentry, LogRocket, Bugsnag)
 * @param {Error} error - The error object
 * @param {Object} errorInfo - React error info with component stack
 * @param {Object} context - Additional context information
 */
export const reportErrorToService = async (error, errorInfo, context = {}) => {
  // Example: Sentry integration
  // if (window.Sentry) {
  //   window.Sentry.withScope((scope) => {
  //     scope.setContext('errorInfo', errorInfo);
  //     scope.setContext('additionalContext', context);
  //     window.Sentry.captureException(error);
  //   });
  // }

  // Example: Custom API endpoint
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: process.env.NODE_ENV,
    };

    // Uncomment to send to your error reporting API
    // await fetch('/api/errors/report', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(errorData),
    // });

    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      logErrorToConsole(error, errorInfo, context);
    }
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};

/**
 * Create an error context object with user and app information
 * @param {Object} additionalContext - Additional context to include
 * @returns {Object} Context object
 */
export const createErrorContext = (additionalContext = {}) => {
  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewportSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    environment: process.env.NODE_ENV,
    ...additionalContext,
  };
};

/**
 * Error handler for Promise rejections
 * @param {PromiseRejectionEvent} event - The unhandled rejection event
 */
export const handleUnhandledRejection = (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);

  // Report to error service
  reportErrorToService(
    new Error(event.reason),
    { componentStack: 'Promise Rejection' },
    createErrorContext({ type: 'unhandledRejection' })
  );
};

/**
 * Error handler for global errors
 * @param {ErrorEvent} event - The error event
 */
export const handleGlobalError = (event) => {
  console.error('Global Error:', event.error);

  // Report to error service
  reportErrorToService(
    event.error,
    { componentStack: 'Global Error' },
    createErrorContext({ type: 'globalError' })
  );
};

/**
 * Initialize global error handlers
 */
export const initializeErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Handle global errors
  window.addEventListener('error', handleGlobalError);

  console.log('Global error handlers initialized');
};

/**
 * Cleanup global error handlers
 */
export const cleanupErrorHandlers = () => {
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  window.removeEventListener('error', handleGlobalError);

  console.log('Global error handlers cleaned up');
};

export default {
  logErrorToConsole,
  reportErrorToService,
  createErrorContext,
  initializeErrorHandlers,
  cleanupErrorHandlers,
};
