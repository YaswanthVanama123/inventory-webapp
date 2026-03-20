import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import goAuditsService from '../../services/goAuditsService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const GoAuditsLocations = () => {
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all, active, inactive

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await goAuditsService.getLocations();

      if (response.success) {
        setLocations(response.data || []);
        showSuccess(`Loaded ${response.data?.length || 0} locations from GoAudits`);
      } else {
        showError('Failed to load locations');
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      showError('Failed to load locations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const filteredLocations = locations.filter(location => {
    // Filter by active status
    if (filterActive === 'active' && location.Active !== 'Yes') return false;
    if (filterActive === 'inactive' && location.Active === 'Yes') return false;

    // Filter by search text
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      (location.Location || location.store_name || location.storename || '').toLowerCase().includes(search) ||
      (location.address || '').toLowerCase().includes(search) ||
      (location.postcode || '').toLowerCase().includes(search) ||
      (location.Company || location.client_name || location.clientname || '').toLowerCase().includes(search) ||
      (location.location_code || '').toLowerCase().includes(search)
    );
  });

  if (loading && locations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            GoAudits Locations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View all locations from GoAudits system
          </p>
        </div>
        <Button
          onClick={loadLocations}
          disabled={loading}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      {locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Locations</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{locations.length}</div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MapPinIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Locations</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {locations.filter(l => l.Active === 'Yes').length}
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtered Results</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{filteredLocations.length}</div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MagnifyingGlassIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, address, company, or code..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Active Filter */}
            <div className="flex gap-2">
              <Button
                onClick={() => setFilterActive('all')}
                variant={filterActive === 'all' ? 'primary' : 'secondary'}
                className="px-4"
              >
                All
              </Button>
              <Button
                onClick={() => setFilterActive('active')}
                variant={filterActive === 'active' ? 'primary' : 'secondary'}
                className="px-4"
              >
                Active
              </Button>
              <Button
                onClick={() => setFilterActive('inactive')}
                variant={filterActive === 'inactive' ? 'primary' : 'secondary'}
                className="px-4"
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Locations Table */}
      {locations.length === 0 && !loading ? (
        <Card>
          <div className="p-12 text-center">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No locations found in GoAudits
            </p>
            <Button onClick={loadLocations} variant="primary" className="mt-4">
              Reload Locations
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No locations match your filters
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((location, index) => (
                    <tr key={location.LocationID || location.guid || location.store_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {location.Location || location.store_name || location.storename || 'N/A'}
                          </div>
                          {location.LocationID && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {location.LocationID}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {location.Company || location.client_name || location.clientname || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                          {location.address && (
                            <div className="break-words">{location.address}</div>
                          )}
                          {location.postcode && (
                            <div className="text-gray-500 dark:text-gray-400 mt-1">
                              {location.postcode}
                            </div>
                          )}
                          {(location.latitude && location.longitude) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              📍 {location.latitude}, {location.longitude}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {location.toemail && (
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span className="truncate max-w-xs">{location.toemail}</span>
                            </div>
                          )}
                          {location.time_zone && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <ClockIcon className="h-4 w-4" />
                              <span>{location.time_zone}</span>
                            </div>
                          )}
                          {location.Updated_On && (
                            <div className="text-xs text-gray-400 mt-1">
                              Updated: {new Date(location.Updated_On).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={location.Active === 'Yes' ? 'success' : 'secondary'}
                        >
                          {location.Active === 'Yes' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GoAuditsLocations;
