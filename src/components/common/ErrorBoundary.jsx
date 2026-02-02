import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import Card from './Card';

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 *
 * Features:
 * - Catches and handles React component errors
 * - Displays user-friendly error message
 * - Shows "Reload Page" button for recovery
 * - Logs error details to console in development
 * - Shows detailed error information in development mode
 * - Matches application theme (Tailwind CSS)
 *
 * @example
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error component stack:', errorInfo.componentStack);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to error reporting service (e.g., Sentry, LogRocket)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Reset error state and reload the page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Full page reload
    window.location.reload();
  };

  handleReset = () => {
    // Reset error state without reloading (try to recover)
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card padding="lg">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-600 dark:text-red-500"
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
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {this.props.errorMessage ||
                    "We're sorry, but something unexpected happened. Please try reloading the page."}
                </p>
              </div>

              {/* Development Mode Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6">
                  <details className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <summary className="cursor-pointer font-semibold text-red-900 dark:text-red-300 mb-2">
                      Error Details (Development Mode)
                    </summary>

                    {/* Error Name and Message */}
                    <div className="mb-4">
                      <p className="font-mono text-sm text-red-800 dark:text-red-400 font-semibold">
                        {this.state.error.name}: {this.state.error.message}
                      </p>
                    </div>

                    {/* Error Stack */}
                    {this.state.error.stack && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-red-900 dark:text-red-300 mb-2">
                          Stack Trace:
                        </h4>
                        <pre className="bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded p-3 overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-300">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {/* Component Stack */}
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <h4 className="font-semibold text-sm text-red-900 dark:text-red-300 mb-2">
                          Component Stack:
                        </h4>
                        <pre className="bg-white dark:bg-slate-800 border border-red-300 dark:border-red-700 rounded p-3 overflow-x-auto text-xs font-mono text-gray-800 dark:text-gray-300">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={this.handleReload}
                  className="flex-1 sm:flex-initial"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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

                {this.props.showReset && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={this.handleReset}
                    className="flex-1 sm:flex-initial"
                  >
                    Try Again
                  </Button>
                )}

                {this.props.onReport && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => this.props.onReport(this.state.error, this.state.errorInfo)}
                    className="flex-1 sm:flex-initial"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Report Issue
                  </Button>
                )}
              </div>

              {/* Error Count (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.errorCount > 1 && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Error occurred {this.state.errorCount} times
                </div>
              )}
            </Card>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  errorMessage: PropTypes.string,
  onError: PropTypes.func,
  onReport: PropTypes.func,
  showReset: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  fallback: null,
  errorMessage: null,
  onError: null,
  onReport: null,
  showReset: false,
};

export default ErrorBoundary;
