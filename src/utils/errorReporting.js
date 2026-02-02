


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


export const reportErrorToService = async (error, errorInfo, context = {}) => {
  
  
  
  
  
  
  
  

  
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

    
    
    
    
    
    
    
    

    
    if (process.env.NODE_ENV === 'development') {
      logErrorToConsole(error, errorInfo, context);
    }
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};


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


export const handleUnhandledRejection = (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);

  
  reportErrorToService(
    new Error(event.reason),
    { componentStack: 'Promise Rejection' },
    createErrorContext({ type: 'unhandledRejection' })
  );
};


export const handleGlobalError = (event) => {
  console.error('Global Error:', event.error);

  
  reportErrorToService(
    event.error,
    { componentStack: 'Global Error' },
    createErrorContext({ type: 'globalError' })
  );
};


export const initializeErrorHandlers = () => {
  
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  
  window.addEventListener('error', handleGlobalError);

  console.log('Global error handlers initialized');
};


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
