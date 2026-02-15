import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import routeStarItemAliasService from '../../services/routeStarItemAliasService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ItemNameAliasMapping = () => {
  const { showSuccess, showError, showWarning } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [uniqueItems, setUniqueItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [stats, setStats] = useState({ totalUniqueItems: 0, mappedItems: 0, unmappedItems: 0 });
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Bulk mapping state
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkMapModal, setShowBulkMapModal] = useState(false);
  const [bulkCanonicalName, setBulkCanonicalName] = useState('');

  // Quick map state
  const [showQuickMapModal, setShowQuickMapModal] = useState(false);
  const [quickMapItem, setQuickMapItem] = useState(null);
  const [quickCanonicalName, setQuickCanonicalName] = useState('');
  const [quickMapSelectedItems, setQuickMapSelectedItems] = useState(new Set());
  const [quickMapSearchText, setQuickMapSearchText] = useState('');
  const [existingMapping, setExistingMapping] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [modalData, setModalData] = useState({
    canonicalName: '',
    aliases: [''],
    description: '',
    autoMerge: true
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Update filtered items when search or filter changes
  useEffect(() => {
    filterItems();
  }, [uniqueItems, searchText, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mappingsData, itemsData, statsData] = await Promise.all([
        routeStarItemAliasService.getAllMappings(),
        routeStarItemAliasService.getUniqueItems(),
        routeStarItemAliasService.getStats()
      ]);

      console.log('Raw API responses:');
      console.log('- mappingsData:', mappingsData);
      console.log('- itemsData:', itemsData);
      console.log('- statsData:', statsData);

      console.log('Loaded data:', {
        mappingsCount: mappingsData.mappings?.length,
        itemsCount: itemsData.items?.length,
        stats: itemsData.stats
      });

      setMappings(mappingsData.mappings || []);
      setUniqueItems(itemsData.items || []);
      setStats(itemsData.stats || statsData);

      console.log('State after setting:', {
        mappings: mappingsData.mappings?.length,
        uniqueItems: itemsData.items?.length,
        stats: itemsData.stats
      });
    } catch (error) {
      console.error('loadData error:', error);
      showError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...uniqueItems];

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchLower) ||
        (item.canonicalName && item.canonicalName.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filterStatus === 'mapped') {
      filtered = filtered.filter(item => item.isMapped);
    } else if (filterStatus === 'unmapped') {
      filtered = filtered.filter(item => !item.isMapped);
    }

    setFilteredItems(filtered);
  };

  const openCreateModal = () => {
    setEditingMapping(null);
    setModalData({
      canonicalName: '',
      aliases: [''],
      description: '',
      autoMerge: true
    });
    setShowModal(true);
  };

  const openEditModal = (mapping) => {
    setEditingMapping(mapping);
    setModalData({
      canonicalName: mapping.canonicalName,
      aliases: mapping.aliases.map(a => a.name),
      description: mapping.description || '',
      autoMerge: mapping.autoMerge !== false
    });
    setShowModal(true);
  };

  const handleModalChange = (field, value) => {
    setModalData(prev => ({ ...prev, [field]: value }));
  };

  const handleAliasChange = (index, value) => {
    const newAliases = [...modalData.aliases];
    newAliases[index] = value;
    setModalData(prev => ({ ...prev, aliases: newAliases }));
  };

  const addAliasField = () => {
    setModalData(prev => ({
      ...prev,
      aliases: [...prev.aliases, '']
    }));
  };

  const removeAliasField = (index) => {
    if (modalData.aliases.length > 1) {
      const newAliases = modalData.aliases.filter((_, i) => i !== index);
      setModalData(prev => ({ ...prev, aliases: newAliases }));
    }
  };

  const saveMapping = async () => {
    // Validation
    if (!modalData.canonicalName.trim()) {
      showError('Canonical name is required');
      return;
    }

    const cleanAliases = modalData.aliases.filter(a => a.trim() !== '');
    if (cleanAliases.length === 0) {
      showError('At least one alias is required');
      return;
    }

    try {
      setSaving(true);

      const data = {
        canonicalName: modalData.canonicalName.trim(),
        aliases: cleanAliases.map(a => a.trim()),
        description: modalData.description.trim(),
        autoMerge: modalData.autoMerge
      };

      if (editingMapping) {
        await routeStarItemAliasService.updateMapping(editingMapping._id, data);
        showSuccess('Mapping updated successfully');
      } else {
        await routeStarItemAliasService.saveMapping(data);
        showSuccess('Mapping created successfully');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      showError('Failed to save mapping: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMapping = async (id, canonicalName) => {
    if (!window.confirm(`Are you sure you want to delete the mapping for "${canonicalName}"?`)) {
      return;
    }

    try {
      await routeStarItemAliasService.deleteMapping(id);
      showSuccess(`Mapping deleted for ${canonicalName}`);
      loadData();
    } catch (error) {
      showError('Failed to delete mapping: ' + error.message);
    }
  };

  const openQuickMapModal = (itemName) => {
    setQuickMapItem(itemName);
    setQuickCanonicalName(itemName);
    setQuickMapSearchText('');

    // Check if this item is already mapped
    const currentMapping = mappings.find(m =>
      m.aliases.some(a => a.name === itemName)
    );

    if (currentMapping) {
      // Item is already mapped - load existing mapping
      setExistingMapping(currentMapping);
      setQuickCanonicalName(currentMapping.canonicalName);
      // Pre-select all items in this mapping
      const aliasNames = new Set(currentMapping.aliases.map(a => a.name));
      setQuickMapSelectedItems(aliasNames);
    } else {
      // New mapping - just pre-select the clicked item
      setExistingMapping(null);
      setQuickMapSelectedItems(new Set([itemName]));
    }

    setShowQuickMapModal(true);
  };

  const toggleQuickMapItem = (itemName) => {
    const newSelected = new Set(quickMapSelectedItems);

    // Don't allow unselecting the main item
    if (itemName === quickMapItem && newSelected.has(itemName) && newSelected.size === 1) {
      showWarning('You must select at least the current item');
      return;
    }

    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setQuickMapSelectedItems(newSelected);
  };

  const quickMapItemSubmit = async () => {
    if (!quickCanonicalName.trim()) {
      showError('Please enter a canonical name');
      return;
    }

    if (quickMapSelectedItems.size === 0) {
      showError('Please select at least one item');
      return;
    }

    try {
      setSaving(true);

      // If updating existing mapping, delete it first
      if (existingMapping) {
        await routeStarItemAliasService.deleteMapping(existingMapping._id);
      }

      // Create new mapping with all selected items
      await routeStarItemAliasService.saveMapping({
        canonicalName: quickCanonicalName.trim(),
        aliases: Array.from(quickMapSelectedItems),
        description: existingMapping ? 'Updated mapping' : 'Quick mapped',
        autoMerge: true
      });

      showSuccess(`Mapped ${quickMapSelectedItems.size} items to "${quickCanonicalName}"`);
      setShowQuickMapModal(false);
      setQuickMapItem(null);
      setQuickCanonicalName('');
      setQuickMapSelectedItems(new Set());
      setQuickMapSearchText('');
      setExistingMapping(null);
      loadData();
    } catch (error) {
      showError('Failed to create mapping: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter items for quick map modal
  const getFilteredItemsForQuickMap = () => {
    return uniqueItems.filter(item => {
      // Exclude already mapped items (unless they're in the current mapping being edited)
      if (item.isMapped && !existingMapping) return false;
      if (item.isMapped && existingMapping && item.canonicalName !== existingMapping.canonicalName) return false;

      // Apply search filter
      if (quickMapSearchText) {
        const searchLower = quickMapSearchText.toLowerCase();
        return item.itemName.toLowerCase().includes(searchLower) ||
               (item.itemParent && item.itemParent.toLowerCase().includes(searchLower));
      }
      return true;
    });
  };

  // Bulk mapping functions
  const toggleItemSelection = (itemName) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const selectAllFiltered = () => {
    const unmappedItems = filteredItems.filter(item => !item.isMapped);
    const newSelected = new Set(unmappedItems.map(item => item.itemName));
    setSelectedItems(newSelected);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const openBulkMapModal = () => {
    if (selectedItems.size === 0) {
      showWarning('Please select at least one item');
      return;
    }
    // Suggest canonical name based on first selected item
    const firstItem = Array.from(selectedItems)[0];
    setBulkCanonicalName(firstItem);
    setShowBulkMapModal(true);
  };

  const bulkMapItems = async () => {
    if (!bulkCanonicalName.trim()) {
      showError('Please enter a canonical name');
      return;
    }

    try {
      setSaving(true);
      await routeStarItemAliasService.saveMapping({
        canonicalName: bulkCanonicalName.trim(),
        aliases: Array.from(selectedItems),
        description: `Bulk mapped ${selectedItems.size} items`,
        autoMerge: true
      });
      showSuccess(`Successfully mapped ${selectedItems.size} items to "${bulkCanonicalName}"`);
      setShowBulkMapModal(false);
      setBulkCanonicalName('');
      clearSelection();
      loadData();
    } catch (error) {
      showError('Failed to create mapping: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Item Name Alias Mapping
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Map different variations of RouteStar item names to a single canonical name (e.g., "jrt-2ply" and "jrt 2pLy" → "JRT-2PLY")
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          📦 Items shown below are from the RouteStarItem master list
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-3xl font-bold">{stats.totalUniqueItems}</div>
          <div className="text-sm opacity-90">Unique Item Names</div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-3xl font-bold">{stats.mappedItems}</div>
          <div className="text-sm opacity-90">Mapped Items</div>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="text-3xl font-bold">{stats.unmappedItems}</div>
          <div className="text-sm opacity-90">Unmapped Items</div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-3xl font-bold">{mappings.length}</div>
          <div className="text-sm opacity-90">Total Mappings</div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('all')}
            >
              All Items
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
                placeholder="Search item names..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedItems.size > 0 && (
              <>
                <Button
                  variant="secondary"
                  onClick={clearSelection}
                >
                  Clear ({selectedItems.size})
                </Button>
                <Button
                  variant="primary"
                  onClick={openBulkMapModal}
                >
                  Map Selected ({selectedItems.size})
                </Button>
              </>
            )}
            {selectedItems.size === 0 && filteredItems.filter(i => !i.isMapped).length > 0 && (
              <Button
                variant="secondary"
                onClick={selectAllFiltered}
              >
                Select All Unmapped
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={loadData}
              icon={<ArrowPathIcon className="w-5 h-5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={openCreateModal}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Create Mapping
            </Button>
          </div>
        </div>
      </Card>

      {/* Existing Mappings */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Existing Mappings ({mappings.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Canonical Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aliases ({mappings.reduce((sum, m) => sum + m.aliases.length, 0)} total)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No mappings found. Create your first mapping to merge item name variations.
                  </td>
                </tr>
              ) : (
                mappings.map((mapping) => (
                  <tr key={mapping._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-lg text-gray-900 dark:text-white">
                        {mapping.canonicalName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {mapping.aliases.map((alias, idx) => (
                          <Badge
                            key={idx}
                            variant="info"
                            className="text-xs"
                          >
                            {alias.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {mapping.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(mapping)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteMapping(mapping._id, mapping.canonicalName)}
                          icon={<TrashIcon className="w-4 h-4" />}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Unmapped Items List */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Item Names ({filteredItems.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.size > 0 && selectedItems.size === filteredItems.filter(i => !i.isMapped).length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAllFiltered();
                      } else {
                        clearSelection();
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mapped To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Occurrences
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantity on Hand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={index}
                    className={item.isMapped ? 'bg-green-50 dark:bg-green-900/10' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!item.isMapped && (
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.itemName)}
                          onChange={() => toggleItemSelection(item.itemName)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {item.itemName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.itemParent || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isMapped ? (
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
                      {item.canonicalName ? (
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.canonicalName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                          Not mapped yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.occurrences}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.qtyOnHand !== undefined ? item.qtyOnHand.toFixed(2) : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!item.isMapped && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openQuickMapModal(item.itemName)}
                        >
                          Quick Map
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Mapping Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMapping ? 'Edit Mapping' : 'Create New Mapping'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Canonical Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Canonical Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., JRT-2PLY"
              value={modalData.canonicalName}
              onChange={(e) => handleModalChange('canonicalName', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is the master name that will be displayed in reports
            </p>
          </div>

          {/* Aliases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aliases <span className="text-red-500">*</span>
            </label>
            {modalData.aliases.map((alias, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder={`e.g., jrt-2ply, jrt 2pLy`}
                  value={alias}
                  onChange={(e) => handleAliasChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeAliasField(index)}
                  icon={<XMarkIcon className="w-4 h-4" />}
                  disabled={modalData.aliases.length === 1}
                />
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={addAliasField}
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Add Another Alias
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              All these variations will be mapped to the canonical name
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <Input
              type="text"
              placeholder="Add notes about this mapping..."
              value={modalData.description}
              onChange={(e) => handleModalChange('description', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Auto Merge Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoMerge"
              checked={modalData.autoMerge}
              onChange={(e) => handleModalChange('autoMerge', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoMerge" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Automatically merge in reports and analytics
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveMapping} disabled={saving}>
              {saving ? 'Saving...' : (editingMapping ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Map Modal */}
      <Modal
        isOpen={showBulkMapModal}
        onClose={() => setShowBulkMapModal(false)}
        title={`Map ${selectedItems.size} Items`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are mapping the following items to a single canonical name:
            </p>
            <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-3 mb-4">
              <ul className="space-y-1">
                {Array.from(selectedItems).map((itemName, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                    • {itemName}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Canonical Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter the master name for these items"
              value={bulkCanonicalName}
              onChange={(e) => setBulkCanonicalName(e.target.value)}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              All selected items will be mapped to this name in reports
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setShowBulkMapModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={bulkMapItems} disabled={saving}>
              {saving ? 'Mapping...' : `Map ${selectedItems.size} Items`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Map Modal */}
      <Modal
        isOpen={showQuickMapModal}
        onClose={() => setShowQuickMapModal(false)}
        title={existingMapping ? `Edit Mapping - ${existingMapping.canonicalName}` : `Map Item - ${quickMapItem}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Current Item Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Main Item:</strong> {quickMapItem}
            </p>
            {existingMapping && (
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                ℹ️ This item is already mapped. You can add more items to this group or modify it.
              </p>
            )}
          </div>

          {/* Canonical Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Canonical Name (Master Name) <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter the canonical name for this group"
              value={quickCanonicalName}
              onChange={(e) => setQuickCanonicalName(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              All selected items will be displayed as this name in reports
            </p>
          </div>

          {/* Selected Items Summary */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
              Selected Items ({quickMapSelectedItems.size}):
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from(quickMapSelectedItems).map((name) => (
                <Badge key={name} variant="success" className="text-xs">
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Items to Group Together
            </label>
            <div className="relative mb-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items to combine..."
                value={quickMapSearchText}
                onChange={(e) => setQuickMapSearchText(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Items List with Checkboxes */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Select
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Item Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Item Parent
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Qty on Hand
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredItemsForQuickMap().map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      quickMapSelectedItems.has(item.itemName) ? 'bg-green-50 dark:bg-green-900/10' : ''
                    }`}
                    onClick={() => toggleQuickMapItem(item.itemName)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={quickMapSelectedItems.has(item.itemName)}
                        onChange={() => toggleQuickMapItem(item.itemName)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {item.itemName}
                      </span>
                      {item.itemName === quickMapItem && (
                        <Badge variant="info" className="ml-2 text-xs">Main</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.itemParent || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.qtyOnHand?.toFixed(2) || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {quickMapSelectedItems.size} item(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowQuickMapModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={quickMapItemSubmit} disabled={saving}>
                {saving ? 'Saving...' : `Map ${quickMapSelectedItems.size} Items`}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ItemNameAliasMapping;
