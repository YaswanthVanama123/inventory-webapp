import React from 'react';
import { useToast } from '../hooks/useToast';

const ToastDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Toast Notification Demo</h1>
      <p className="text-slate-600 mb-8">
        Click the buttons below to test different types of toast notifications.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => showSuccess('Operation completed successfully!')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          Success Toast
        </button>

        <button
          onClick={() => showError('An error occurred. Please try again.')}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          Error Toast
        </button>

        <button
          onClick={() => showWarning('This action cannot be undone.')}
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-sm"
        >
          Warning Toast
        </button>

        <button
          onClick={() => showInfo('New updates are available.')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          Info Toast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => showToast('This toast lasts 2 seconds', 'info', 2000)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
        >
          Short Duration (2s)
        </button>

        <button
          onClick={() => showToast('This toast lasts 8 seconds', 'info', 8000)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          Long Duration (8s)
        </button>
      </div>

      <div className="mb-8">
        <button
          onClick={() => {
            showSuccess('Item 1 saved');
            setTimeout(() => showSuccess('Item 2 saved'), 300);
            setTimeout(() => showSuccess('Item 3 saved'), 600);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium shadow-sm"
        >
          Multiple Toasts (Stacked)
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Usage Examples</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Basic Usage:</h3>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useToast } from '../hooks/useToast';

function MyComponent() {
  const { showToast, showSuccess, showError } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Item saved successfully!');
    } catch (error) {
      showError('Failed to save item.');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Available Methods:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li><code className="bg-slate-200 px-2 py-1 rounded text-sm">showSuccess(message, duration?)</code> - Green success toast</li>
              <li><code className="bg-slate-200 px-2 py-1 rounded text-sm">showError(message, duration?)</code> - Red error toast</li>
              <li><code className="bg-slate-200 px-2 py-1 rounded text-sm">showWarning(message, duration?)</code> - Yellow warning toast</li>
              <li><code className="bg-slate-200 px-2 py-1 rounded text-sm">showInfo(message, duration?)</code> - Blue info toast</li>
              <li><code className="bg-slate-200 px-2 py-1 rounded text-sm">showToast(message, type, duration?)</code> - Generic toast with custom type</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>Auto-dismiss after 4 seconds (default, customizable)</li>
              <li>Manual close button</li>
              <li>Multiple toasts stack vertically</li>
              <li>Smooth slide-in/out animations</li>
              <li>Responsive positioning (top-right on desktop, centered on mobile)</li>
              <li>Type-specific icons and colors</li>
              <li>Tailwind CSS styling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;
