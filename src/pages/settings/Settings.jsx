import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const Settings = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [activeTab, setActiveTab] = useState('categories'); 

  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add'); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ value: '', label: '' });
  const [categoryModalLoading, setCategoryModalLoading] = useState(false);

  
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitModalMode, setUnitModalMode] = useState('add'); 
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({ value: '', label: '' });
  const [unitModalLoading, setUnitModalLoading] = useState(false);

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'categories' || tab === 'units') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        settingsService.getCategories(true), 
        settingsService.getUnits(true), 
      ]);

      
      const categoriesData = categoriesRes?.categories || [];
      const unitsData = unitsRes?.units || [];

      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      
      setCategories([]);
      setUnits([]);
      showError(error.message || 'Failed to load settings. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleAddCategory = () => {
    setCategoryForm({ value: '', label: '' });
    setCategoryModalMode('add');
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({ value: category.value, label: category.label });
    setCategoryModalMode('edit');
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.value.trim() || !categoryForm.label.trim()) {
      showError('Category value and label are required');
      return;
    }

    setCategoryModalLoading(true);
    try {
      if (categoryModalMode === 'add') {
        await settingsService.addCategory(categoryForm);
        showSuccess('Category added successfully');
      } else {
        await settingsService.updateCategory(selectedCategory._id, categoryForm);
        showSuccess('Category updated successfully');
      }
      setCategoryModalOpen(false);
      fetchSettings();
    } catch (error) {
      console.error('Error saving category:', error);
      showError(error.message || 'Failed to save category');
    } finally {
      setCategoryModalLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await settingsService.deleteCategory(categoryId);
      showSuccess('Category deleted successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error deleting category:', error);
      showError(error.message || 'Failed to delete category');
    }
  };

  
  const handleAddUnit = () => {
    setUnitForm({ value: '', label: '' });
    setUnitModalMode('add');
    setSelectedUnit(null);
    setUnitModalOpen(true);
  };

  const handleEditUnit = (unit) => {
    setUnitForm({ value: unit.value, label: unit.label });
    setUnitModalMode('edit');
    setSelectedUnit(unit);
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!unitForm.value.trim() || !unitForm.label.trim()) {
      showError('Unit value and label are required');
      return;
    }

    setUnitModalLoading(true);
    try {
      if (unitModalMode === 'add') {
        await settingsService.addUnit(unitForm);
        showSuccess('Unit added successfully');
      } else {
        await settingsService.updateUnit(selectedUnit._id, unitForm);
        showSuccess('Unit updated successfully');
      }
      setUnitModalOpen(false);
      fetchSettings();
    } catch (error) {
      console.error('Error saving unit:', error);
      showError(error.message || 'Failed to save unit');
    } finally {
      setUnitModalLoading(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      await settingsService.deleteUnit(unitId);
      showSuccess('Unit deleted successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error deleting unit:', error);
      showError(error.message || 'Failed to delete unit');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage categories, units, and system configuration</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Categories ({categories.filter((c) => c.isActive).length})
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'units'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Units ({units.filter((u) => u.isActive).length})
            </button>
          </div>
        </div>

        {}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Inventory Categories</h2>
              <Button variant="primary" onClick={handleAddCategory}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`bg-slate-50 rounded-lg p-4 border-2 ${
                    category.isActive ? 'border-slate-200' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{category.label}</h3>
                      <p className="text-sm text-slate-500 font-mono">{category.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {category.isActive ? (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                      Edit
                    </Button>
                    {category.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No categories found. Add your first category to get started.</p>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'units' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Inventory Units</h2>
              <Button variant="primary" onClick={handleAddUnit}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Unit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  className={`bg-slate-50 rounded-lg p-4 border-2 ${
                    unit.isActive ? 'border-slate-200' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{unit.label}</h3>
                      <p className="text-sm text-slate-500 font-mono">{unit.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {unit.isActive ? (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUnit(unit)}>
                      Edit
                    </Button>
                    {unit.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUnit(unit._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {units.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No units found. Add your first unit to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => !categoryModalLoading && setCategoryModalOpen(false)}
        title={categoryModalMode === 'add' ? 'Add Category' : 'Edit Category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCategoryModalOpen(false)} disabled={categoryModalLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCategory} loading={categoryModalLoading}>
              {categoryModalMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Label"
            name="label"
            value={categoryForm.label}
            onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
            placeholder="e.g., Electronics"
            required
            fullWidth
          />
          <Input
            label="Value"
            name="value"
            value={categoryForm.value}
            onChange={(e) => setCategoryForm({ ...categoryForm, value: e.target.value.toLowerCase() })}
            placeholder="e.g., electronics"
            helperText="Lowercase, no spaces (use hyphens for multiple words)"
            required
            fullWidth
          />
        </div>
      </Modal>

      {}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => !unitModalLoading && setUnitModalOpen(false)}
        title={unitModalMode === 'add' ? 'Add Unit' : 'Edit Unit'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUnitModalOpen(false)} disabled={unitModalLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUnit} loading={unitModalLoading}>
              {unitModalMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Label"
            name="label"
            value={unitForm.label}
            onChange={(e) => setUnitForm({ ...unitForm, label: e.target.value })}
            placeholder="e.g., Kilograms"
            required
            fullWidth
          />
          <Input
            label="Value"
            name="value"
            value={unitForm.value}
            onChange={(e) => setUnitForm({ ...unitForm, value: e.target.value.toLowerCase() })}
            placeholder="e.g., kg"
            helperText="Lowercase abbreviation"
            required
            fullWidth
          />
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
