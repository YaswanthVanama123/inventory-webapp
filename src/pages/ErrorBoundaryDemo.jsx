import React, { useState } from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ErrorFallback from '../components/common/ErrorFallback';
import Button from '../components/common/Button';
import Card from '../components/common/Card';


const ErrorThrower = ({ shouldThrow, errorType = 'render' }) => {
  const [count, setCount] = useState(0);

  
  if (shouldThrow && errorType === 'render') {
    throw new Error('Test render error: Component intentionally failed during render');
  }

  
  const handleClick = () => {
    if (errorType === 'event') {
      throw new Error('Test event error: Button click handler failed');
    }
    setCount(count + 1);
  };

  
  const handleAsyncError = async () => {
    if (errorType === 'async') {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test async error: Async operation failed')), 100);
      });
    }
  };

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p className="text-green-800 dark:text-green-300 mb-2">
        This component is working fine! Count: {count}
      </p>
      <div className="flex gap-2">
        <Button onClick={handleClick} size="sm">
          Increment
        </Button>
        <Button onClick={handleAsyncError} size="sm" variant="secondary">
          Trigger Async Error
        </Button>
      </div>
    </div>
  );
};

/**
 * Error Boundary Demo Page
 * Demonstrates different error boundary scenarios
 */
const ErrorBoundaryDemo = () => {
  const [scenario, setScenario] = useState(null);
  const [key, setKey] = useState(0);

  const resetScenario = () => {
    setScenario(null);
    setKey(key + 1); // Force remount of error boundary
  };

  const scenarios = [
    {
      id: 'render-error',
      title: 'Render Error',
      description: 'Component throws error during render (caught by ErrorBoundary)',
      component: <ErrorThrower shouldThrow={true} errorType="render" />,
    },
    {
      id: 'event-error',
      title: 'Event Handler Error',
      description: 'Error thrown in event handler (NOT caught by ErrorBoundary - use try-catch)',
      component: <ErrorThrower shouldThrow={false} errorType="event" />,
    },
    {
      id: 'async-error',
      title: 'Async Error',
      description: 'Error in async operation (NOT caught by ErrorBoundary - use .catch())',
      component: <ErrorThrower shouldThrow={false} errorType="async" />,
    },
    {
      id: 'custom-fallback',
      title: 'Custom Fallback',
      description: 'ErrorBoundary with custom ErrorFallback component',
      component: <ErrorThrower shouldThrow={true} errorType="render" />,
      customFallback: (
        <ErrorFallback
          title="Custom Error UI"
          message="This is a custom error fallback component with a retry option."
          icon="error"
          size="md"
          showRetry={true}
          onRetry={resetScenario}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Error Boundary Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test different error scenarios and see how ErrorBoundary handles them
          </p>
        </div>

        {}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                About Error Boundaries
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Error Boundaries catch errors during rendering, in lifecycle methods, and in
                constructors of the whole tree below them. They do NOT catch errors in event
                handlers, async code, or server-side rendering.
              </p>
            </div>
          </div>
        </Card>

        {}
        <Card title="Select a Test Scenario" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`p-4 text-left border-2 rounded-lg transition-all ${
                  scenario === s.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {s.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {s.description}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Active Scenario */}
        {scenario && (
          <Card title="Test Result" className="mb-6">
            <div className="mb-4">
              <Button onClick={resetScenario} variant="outline" size="sm">
                Reset Scenario
              </Button>
            </div>

            {/* Render selected scenario with ErrorBoundary */}
            {scenarios.map((s) => {
              if (s.id !== scenario) return null;

              return (
                <ErrorBoundary
                  key={`${s.id}-${key}`}
                  fallback={s.customFallback}
                  onError={(error, errorInfo) => {
                    console.log('Error caught by boundary:', error.message);
                  }}
                  showReset={!s.customFallback}
                >
                  {s.component}
                </ErrorBoundary>
              );
            })}
          </Card>
        )}

        {/* Working Component (No Errors) */}
        <Card title="Working Component" className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This component is wrapped in an ErrorBoundary but works normally:
          </p>
          <ErrorBoundary key={`working-${key}`}>
            <ErrorThrower shouldThrow={false} errorType="none" />
          </ErrorBoundary>
        </Card>

        {}
        <Card title="Usage Examples">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Basic ErrorBoundary Usage
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                With Custom Fallback
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`const fallback = (
  <ErrorFallback
    title="Custom Error"
    message="Something went wrong"
    showRetry={true}
    onRetry={handleRetry}
  />
);

<ErrorBoundary fallback={fallback}>
  <YourComponent />
</ErrorBoundary>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                With Error Reporting
              </h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`<ErrorBoundary
  onError={(error, info) => {
    logErrorToService(error, info);
  }}
>
  <YourComponent />
</ErrorBoundary>`}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
