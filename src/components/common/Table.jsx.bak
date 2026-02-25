import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Table = ({
  columns,
  data,
  sortable = false,
  hoverable = true,
  striped = false,
  responsive = true,
  className = '',
  emptyMessage = 'No data available',
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortable || !sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  const SortIcon = ({ columnKey }) => {
    if (!sortable) return null;

    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const tableContent = (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                sortable && column.sortable !== false ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800' : ''
              }`}
              onClick={() => column.sortable !== false && handleSort(column.key)}
            >
              <div className="flex items-center">
                {column.label}
                {column.sortable !== false && <SortIcon columnKey={column.key} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 ${striped ? 'divide-y-0' : ''}`}>
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 sm:px-4 lg:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          sortedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={`
                ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors' : ''}
                ${striped && rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-gray-100"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (responsive) {
    return (
      <div className={`shadow-md rounded-lg ${className}`}>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <div className="overflow-hidden">
              {tableContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={`shadow-md rounded-lg ${className}`}>{tableContent}</div>;
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortable: PropTypes.bool,
  hoverable: PropTypes.bool,
  striped: PropTypes.bool,
  responsive: PropTypes.bool,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default Table;
