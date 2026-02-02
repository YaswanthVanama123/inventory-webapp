import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';


const ErrorFallback = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  icon = 'alert',
  size = 'md',
  showReload = true,
  showRetry = false,
  onRetry,
  className = '',
}) => {
  const sizeStyles = {
    sm: {
      container: 'p-4',
      icon: 'w-12 h-12',
      iconCircle: 'w-8 h-8',
      title: 'text-lg',
      message: 'text-sm',
    },
    md: {
      container: 'p-6',
      icon: 'w-16 h-16',
      iconCircle: 'w-10 h-10',
      title: 'text-xl',
      message: 'text-base',
    },
    lg: {
      container: 'p-8',
      icon: 'w-20 h-20',
      iconCircle: 'w-12 h-12',
      title: 'text-2xl',
      message: 'text-lg',
    },
  };

  const icons = {
    alert: (
      <svg
        className={`${sizeStyles[size].iconCircle} text-red-600 dark:text-red-500`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"//www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg
        className={`${sizeStyles[size].iconCircle} text-red-600 dark:text-red-500`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"//www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className={`${sizeStyles[size].iconCircle} text-yellow-600 dark:text-yellow-500`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${sizeStyles[size].container} ${className}`}
    >
      {/* Error Icon */}
      <div className="flex justify-center mb-4">
        <div className={`${sizeStyles[size].icon} bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center`}>
          {icons[icon] || icons.alert}
        </div>
      </div>

      {/* Error Message */}
      <div className="text-center mb-4">
        <h3 className={`${sizeStyles[size].title} font-semibold text-gray-900 dark:text-white mb-2`}>
          {title}
        </h3>
        <p className={`${sizeStyles[size].message} text-gray-600 dark:text-gray-400`}>
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      {(showReload || showRetry) && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {showRetry && onRetry && (
            <Button variant="primary" size="md" onClick={handleRetry}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"//www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Button>
          )}

          {showReload && (
            <Button
              variant={showRetry ? 'outline' : 'primary'}
              size="md"
              onClick={handleReload}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"//www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reload Page
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

ErrorFallback.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.oneOf(['alert', 'error', 'warning']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showReload: PropTypes.bool,
  showRetry: PropTypes.bool,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default ErrorFallback;
