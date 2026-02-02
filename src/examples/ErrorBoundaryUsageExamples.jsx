/**
 * Example: Wrapping Complex Components with ErrorBoundary
 *
 * This file demonstrates how to wrap specific complex components
 * (like forms, tables, etc.) with ErrorBoundary within a page.
 */

import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ErrorFallback from '../components/common/ErrorFallback';

// Example 1: Wrapping a complex form
export const FormWithErrorBoundary = () => {
  return (
    <div className="container">
      <h1>Product Form</h1>

      <ErrorBoundary
        errorMessage="Unable to load the form. Please refresh and try again."
        showReset={true}
      >
        <ComplexProductForm />
      </ErrorBoundary>
    </div>
  );
};

// Example 2: Wrapping a data table with custom fallback
export const TableWithErrorBoundary = () => {
  const tableFallback = (
    <ErrorFallback
      title="Unable to load table"
      message="We couldn't load the inventory data. Please check your connection and try again."
      size="md"
      showRetry={true}
      onRetry={() => window.location.reload()}
    />
  );

  return (
    <div className="container">
      <h1>Inventory List</h1>

      <ErrorBoundary fallback={tableFallback}>
        <InventoryTable />
      </ErrorBoundary>
    </div>
  );
};

// Example 3: Multiple sections with separate error boundaries
export const DashboardWithMultipleErrorBoundaries = () => {
  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* Stats Section */}
      <ErrorBoundary
        errorMessage="Unable to load statistics"
        fallback={
          <ErrorFallback
            title="Stats Unavailable"
            message="Statistics could not be loaded."
            size="sm"
          />
        }
      >
        <StatsSection />
      </ErrorBoundary>

      {/* Recent Activity Section */}
      <ErrorBoundary
        errorMessage="Unable to load recent activity"
        fallback={
          <ErrorFallback
            title="Activity Unavailable"
            message="Recent activity could not be loaded."
            size="sm"
          />
        }
      >
        <RecentActivitySection />
      </ErrorBoundary>

      {/* Charts Section */}
      <ErrorBoundary
        errorMessage="Unable to load charts"
        fallback={
          <ErrorFallback
            title="Charts Unavailable"
            message="Charts could not be loaded."
            size="sm"
          />
        }
      >
        <ChartsSection />
      </ErrorBoundary>
    </div>
  );
};

// Example 4: Form with error reporting
export const FormWithErrorReporting = () => {
  const handleFormError = (error, errorInfo) => {
    // Log to analytics
    console.log('Form error:', error.message);

    // Send to error tracking service
    // reportErrorToService(error, errorInfo, {
    //   formType: 'invoice',
    //   userId: currentUser.id,
    // });
  };

  return (
    <div className="container">
      <h1>Invoice Form</h1>

      <ErrorBoundary
        onError={handleFormError}
        errorMessage="There was an error with the invoice form."
      >
        <InvoiceForm />
      </ErrorBoundary>
    </div>
  );
};

// Example 5: Nested error boundaries for complex layouts
export const NestedErrorBoundaries = () => {
  return (
    <div className="container">
      <h1>Complex Page Layout</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div>
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        </div>

        {/* Right Column */}
        <div>
          {/* Main Content */}
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>

          {/* Comments Section (separate boundary) */}
          <ErrorBoundary
            fallback={
              <ErrorFallback
                title="Comments Unavailable"
                message="Unable to load comments."
                size="sm"
              />
            }
          >
            <CommentsSection />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

// Example 6: Conditional error boundaries
export const ConditionalErrorBoundary = ({ isComplexView }) => {
  return (
    <div className="container">
      <h1>Dynamic View</h1>

      {/* Only wrap complex view with error boundary */}
      {isComplexView ? (
        <ErrorBoundary>
          <ComplexView />
        </ErrorBoundary>
      ) : (
        <SimpleView />
      )}
    </div>
  );
};

// Example 7: Error boundary with retry mechanism
export const ErrorBoundaryWithRetry = () => {
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
  };

  const retryFallback = (
    <ErrorFallback
      title="Failed to Load"
      message={`Retry attempt: ${retryCount}`}
      showRetry={true}
      onRetry={handleRetry}
    />
  );

  return (
    <div className="container">
      <h1>Component with Retry</h1>

      <ErrorBoundary key={retryCount} fallback={retryFallback}>
        <DataComponent />
      </ErrorBoundary>
    </div>
  );
};

/*
 * USAGE PATTERNS SUMMARY
 *
 * 1. Wrap entire forms to catch validation/submission errors
 * 2. Wrap data tables/grids to handle render errors with large datasets
 * 3. Wrap chart/visualization components that might fail
 * 4. Use separate boundaries for independent sections
 * 5. Add custom error reporting for critical components
 * 6. Use nested boundaries for complex layouts
 * 7. Implement retry mechanisms for recoverable errors
 *
 * BEST PRACTICES:
 *
 * - Place boundaries at logical component boundaries
 * - Don't over-wrap - too many boundaries can hide issues
 * - Use specific error messages for better UX
 * - Add error reporting for production monitoring
 * - Test error scenarios in development
 * - Document which components are wrapped and why
 */

// Dummy components for examples
const ComplexProductForm = () => <div>Form</div>;
const InventoryTable = () => <div>Table</div>;
const StatsSection = () => <div>Stats</div>;
const RecentActivitySection = () => <div>Activity</div>;
const ChartsSection = () => <div>Charts</div>;
const InvoiceForm = () => <div>Invoice Form</div>;
const Sidebar = () => <div>Sidebar</div>;
const MainContent = () => <div>Content</div>;
const CommentsSection = () => <div>Comments</div>;
const ComplexView = () => <div>Complex</div>;
const SimpleView = () => <div>Simple</div>;
const DataComponent = () => <div>Data</div>;
