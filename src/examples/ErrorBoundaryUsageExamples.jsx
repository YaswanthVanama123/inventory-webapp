

import React from 'react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ErrorFallback from '../components/common/ErrorFallback';


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


export const DashboardWithMultipleErrorBoundaries = () => {
  return (
    <div className="container">
      <h1>Dashboard</h1>

      {}
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

      {}
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

      {}
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


export const FormWithErrorReporting = () => {
  const handleFormError = (error, errorInfo) => {
    
    console.log('Form error:', error.message);

    
    
    
    
    
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


export const NestedErrorBoundaries = () => {
  return (
    <div className="container">
      <h1>Complex Page Layout</h1>

      <div className="grid grid-cols-2 gap-4">
        {}
        <div>
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
        </div>

        {}
        <div>
          {}
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>

          {}
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


export const ConditionalErrorBoundary = ({ isComplexView }) => {
  return (
    <div className="container">
      <h1>Dynamic View</h1>

      {}
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
