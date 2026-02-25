import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import { modelCategoryService } from '../../services/modelCategoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import SearchableSelect from '../../components/common/SearchableSelect';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

const ModelCategoryMapping = () => {
  const { showSuccess, showError, showWarning } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState([]);
  const [routeStarItems, setRouteStarItems] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [stats, setStats] = useState({ total: 0, mapped: 0, unmapped: 0 });

  
  useEffect(() => {
    loadData();
  }, []);

  
  useEffect(() => {
    filterModels();
  }, [models, searchText, filterStatus]);

  
  useEffect(() => {
    updateStats();
  }, [models]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelsData, itemsData] = await Promise.all([
        modelCategoryService.getUniqueModels(),
        modelCategoryService.getRouteStarItems()
      ]);

      setModels(modelsData.models || []);
      setRouteStarItems(itemsData.items || []);
    } catch (error) {
      showError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const mapped = models.filter(m => m.categoryItemName).length;
    const unmapped = models.length - mapped;
    setStats({ total: models.length, mapped, unmapped });
  };

  const filterModels = () => {
    let filtered = [...models];

    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(m =>
        m.modelNumber.toLowerCase().includes(searchLower) ||
        (m.orderItemName && m.orderItemName.toLowerCase().includes(searchLower)) ||
        (m.categoryItemName && m.categoryItemName.toLowerCase().includes(searchLower))
      );
    }

    
    if (filterStatus === 'mapped') {
      filtered = filtered.filter(m => m.categoryItemName);
    } else if (filterStatus === 'unmapped') {
      filtered = filtered.filter(m => !m.categoryItemName);
    }

    setFilteredModels(filtered);
  };

  const handleCategoryChange = (modelNumber, categoryItemId) => {
    const item = routeStarItems.find(i => i._id === categoryItemId);
    setModels(prevModels =>
      prevModels.map(m =>
        m.modelNumber === modelNumber
          ? {
              ...m,
              categoryItemId,
              categoryItemName: item ? item.itemName : null
            }
          : m
      )
    );
    setPendingChanges(prev => new Set([...prev, modelNumber]));
  };

  const handleNotesChange = (modelNumber, notes) => {
    setModels(prevModels =>
      prevModels.map(m =>
        m.modelNumber === modelNumber ? { ...m, notes } : m
      )
    );
    setPendingChanges(prev => new Set([...prev, modelNumber]));
  };

  const saveMapping = async (modelNumber) => {
    const model = models.find(m => m.modelNumber === modelNumber);
    if (!model || !model.categoryItemId) {
      showError('Please select a category first');
      return;
    }

    try {
      setSaving(true);
      await modelCategoryService.saveMapping({
        modelNumber: model.modelNumber,
        categoryItemName: model.categoryItemName,
        categoryItemId: model.categoryItemId,
        notes: model.notes || ''
      });

      showSuccess(`Mapping saved for ${modelNumber}`);
      setPendingChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelNumber);
        return newSet;
      });
    } catch (error) {
      showError('Failed to save mapping: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    if (pendingChanges.size === 0) {
      showWarning('No changes to save');
      return;
    }

    try {
      setSaving(true);
      const promises = Array.from(pendingChanges).map(modelNumber =>
        saveMapping(modelNumber)
      );
      await Promise.all(promises);
      showSuccess(`Saved ${pendingChanges.size} changes`);
      setPendingChanges(new Set());
      loadData();
    } catch (error) {
      showError('Some changes failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteMapping = async (modelNumber) => {
    if (!window.confirm(`Are you sure you want to delete the mapping for ${modelNumber}?`)) {
      return;
    }

    try {
      await modelCategoryService.deleteMapping(modelNumber);
      showSuccess(`Mapping deleted for ${modelNumber}`);
      loadData();
    } catch (error) {
      showError('Failed to delete mapping: ' + error.message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Model Category Mapping
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Map order model numbers (SKUs) to RouteStar item categories
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Models */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Models</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mapped */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Mapped</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{stats.mapped}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats.total > 0 ? Math.round((stats.mapped / stats.total) * 100) : 0}% completion
            </p>
          </div>
        </div>

        {/* Unmapped */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Unmapped</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats.unmapped}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Requires attention
            </p>
          </div>
        </div>

        {/* RouteStar Items Available */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">RouteStar Items Available</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500">{routeStarItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Items ready for mapping
            </p>
          </div>
        </div>
      </div>

      {}
      <Card>
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('all')}
            >
              All Models
            </Button>
            <Button
              variant={filterStatus === 'mapped' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('mapped')}
            >
              Mapped
            </Button>
            <Button
              variant={filterStatus === 'unmapped' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('unmapped')}
            >
              Unmapped
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search model numbers, item names..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={loadData}
              icon={<ArrowPathIcon className="w-5 h-5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={saveAllChanges}
              disabled={pendingChanges.size === 0 || saving}
            >
              Save All ({pendingChanges.size})
            </Button>
          </div>
        </div>
      </Card>

      {}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mapped Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category (RouteStar Item)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No models found
                  </td>
                </tr>
              ) : (
                filteredModels.map((record, index) => (
                  <tr
                    key={record.modelNumber}
                    className={record.categoryItemName ? 'bg-green-50 dark:bg-green-900/10' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {record.modelNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {record.orderItemName || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.categoryItemName ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircleIcon className="w-4 h-4" />
                          Mapped
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="flex items-center gap-1 w-fit">
                          <XCircleIcon className="w-4 h-4" />
                          Unmapped
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.categoryItemName ? (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.categoryItemName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                          Not mapped yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <SearchableSelect
                        value={record.categoryItemId || ''}
                        onChange={(categoryItemId) => handleCategoryChange(record.modelNumber, categoryItemId)}
                        options={routeStarItems}
                        placeholder={
                          routeStarItems.length === 0
                            ? 'Loading items...'
                            : `Select category (${routeStarItems.length} available)`
                        }
                        searchPlaceholder="Search items..."
                        getOptionValue={(item) => item._id}
                        getOptionLabel={(item) => {
                          let label = item.itemName;
                          if (item.mergedCount > 1) label += ` (${item.mergedCount} merged)`;
                          if (item.itemParent) label += ` - ${item.itemParent}`;
                          if (item.description) {
                            const shortDesc = item.description.substring(0, 50);
                            label += ` | ${shortDesc}${item.description.length > 50 ? '...' : ''}`;
                          }
                          return label;
                        }}
                        renderOption={(item) => (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {item.itemName}
                              </span>
                              {item.mergedCount > 1 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  {item.mergedCount} merged
                                </span>
                              )}
                            </div>
                            {(item.itemParent || item.description) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.itemParent && <span className="font-medium">{item.itemParent}</span>}
                                {item.itemParent && item.description && ' • '}
                                {item.description && (
                                  <span className="truncate block">
                                    {item.description.substring(0, 80)}
                                    {item.description.length > 80 ? '...' : ''}
                                  </span>
                                )}
                              </span>
                            )}
                            {item.variations && item.variations.length > 1 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate" title={item.variations.join(', ')}>
                                Variations: {item.variations.slice(0, 3).join(', ')}
                                {item.variations.length > 3 && ` +${item.variations.length - 3} more`}
                              </span>
                            )}
                          </div>
                        )}
                        emptyMessage="No items found. Try a different search."
                        className="w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="text"
                        placeholder="Add notes..."
                        value={record.notes || ''}
                        onChange={(e) => handleNotesChange(record.modelNumber, e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => saveMapping(record.modelNumber)}
                          disabled={saving}
                        >
                          Save
                        </Button>
                        {record.categoryItemName && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteMapping(record.modelNumber)}
                            icon={<TrashIcon className="w-4 h-4" />}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ModelCategoryMapping;
