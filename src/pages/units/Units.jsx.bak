import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import settingsService from '../../services/settingsService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';

const Units = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);

  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [form, setForm] = useState({ value: '', label: '' });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getUnits(true); 
      const unitsData = response?.data?.units || [];
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
      showError(error.message || 'Failed to load units. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setForm({ value: '', label: '' });
    setModalMode('add');
    setSelectedUnit(null);
    setModalOpen(true);
  };

  const handleEdit = (unit) => {
    setForm({ value: unit.value, label: unit.label });
    setModalMode('edit');
    setSelectedUnit(unit);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.value.trim() || !form.label.trim()) {
      showError('Unit value and label are required');
      return;
    }

    
    const normalizedValue = form.value.trim().toLowerCase();
    const isDuplicate = units.some(unit => {
      
      if (modalMode === 'edit' && selectedUnit && unit._id === selectedUnit._id) {
        return false;
      }
      return unit.value.toLowerCase() === normalizedValue;
    });

    if (isDuplicate) {
      showError('A unit with this value already exists');
      return;
    }

    setModalLoading(true);
    try {
      if (modalMode === 'add') {
        await settingsService.addUnit(form);
        showSuccess('Unit added successfully');
      } else {
        await settingsService.updateUnit(selectedUnit._id, form);
        showSuccess('Unit updated successfully');
      }
      setModalOpen(false);
      fetchUnits();
    } catch (error) {
      console.error('Error saving unit:', error);
      showError(error.message || 'Failed to save unit');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      await settingsService.deleteUnit(unitId);
      showSuccess('Unit deleted successfully');
      fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
      showError(error.message || 'Failed to delete unit');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Measurement Units
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage units of measurement for your inventory
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={handleAdd} variant="primary">
            + Add Unit
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {units.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No units found. Add your first unit to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {units.map((unit) => (
                    <tr key={unit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {unit.value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {unit.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={unit.isActive ? 'success' : 'secondary'}>
                          {unit.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(unit._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalMode === 'add' ? 'Add Unit' : 'Edit Unit'}
        >
          <div className="space-y-4">
            <Input
              label="Value"
              name="value"
              value={form.value}
              onChange={handleFormChange}
              placeholder="e.g., kg"
              required
              fullWidth
            />
            <Input
              label="Label"
              name="label"
              value={form.label}
              onChange={handleFormChange}
              placeholder="e.g., Kilograms"
              required
              fullWidth
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={modalLoading}
              disabled={modalLoading}
            >
              {modalMode === 'add' ? 'Add' : 'Update'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Units;
