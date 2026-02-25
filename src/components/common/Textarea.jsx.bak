import React from 'react';

const Textarea = React.forwardRef(({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y";
  const normalClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  const textareaClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
