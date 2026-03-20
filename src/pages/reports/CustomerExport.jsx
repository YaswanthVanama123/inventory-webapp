import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CustomerExport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/reports/export-customers?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to export customers');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `routestar_customers_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('Customers exported successfully!');
    } catch (err) {
      setError(err.message || 'Failed to export customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Export Customers</h1>
        <p className="mt-2 text-gray-600">
          Export RouteStar customer data from closed invoices by date range
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Select Date Range
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-700">Format:</p>
              <p className="text-gray-600">CSV (Comma Separated Values)</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Date Filter:</p>
              <p className="text-gray-600">Based on invoice date from closed invoices</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Fields Exported:</p>
              <ul className="text-gray-600 list-disc list-inside mt-1 space-y-1">
                <li>Customer Name</li>
                <li>Address</li>
                <li>City</li>
                <li>State</li>
                <li>Pincode</li>
                <li>Email</li>
                <li>Phone</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-gray-600 italic">
                Note: Exports only unique customers (case-insensitive) from closed invoices within the selected date range. Invoice-specific fields are not included.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerExport;
