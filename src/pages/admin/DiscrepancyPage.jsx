import React, { useState } from 'react';
import DiscrepancyManagement from './DiscrepancyManagement';
import OrderDiscrepancyList from './OrderDiscrepancyList';

const DiscrepancyPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="p-6 space-y-5">
      {}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Discrepancies
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Track and manage sales and order discrepancies
          </p>
        </div>
      </div>
      {}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'sales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sales Discrepancies
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Order Discrepancies
          </button>
        </div>
      </div>
      {}
      <div className="pt-2">
        {activeTab === 'sales' && <DiscrepancyManagement />}
        {activeTab === 'orders' && <OrderDiscrepancyList />}
      </div>
    </div>
  );
};
export default DiscrepancyPage;
