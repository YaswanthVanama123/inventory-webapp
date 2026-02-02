import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';
import settingsService from '../../services/settingsService';
import { FileText, DollarSign, Building2, Image } from 'lucide-react';

const InventoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { showSuccess, showError, showWarning, showInfo } = useContext(ToastContext);
  const { isAdmin } = useAuth();

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    // If it's a blob URL (from file input), return as is
    if (typeof image === 'string' && image.startsWith('blob:')) return image;

    // If it's a placeholder, return as is
    if (image === '/placeholder-product.png') return image;

    // Extract path from image object or use string directly
    const path = typeof image === 'object' ? image?.path : image;

    if (!path) return '/placeholder-product.png';

    // If it's already a full URL (from ImgBB or other source), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // For legacy local images
    if (path.startsWith('/uploads')) {
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${backendUrl}${path}`;
    }

    return path;
  };

  // Current step state (0-3 for 4 steps)
  const [currentStep, setCurrentStep] = useState(0);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    itemName: '',
    skuCode: '',
    description: '',
    category: '', // Always string, never undefined
    tags: [],

    // Quantity & Pricing
    currentQuantity: '',
    minimumQuantity: '',
    unit: '', // Always string, never undefined
    purchasePrice: '',
    sellingPrice: '',

    // Supplier Information
    supplierName: '',
    contactPerson: '',
    supplierEmail: '',
    supplierPhone: '',
    supplierAddress: '',
    leadTime: '',
    reorderPoint: '',
    minOrderQuantity: '',

    // Images
    images: [],
    primaryImageIndex: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // Image preview states
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Categories and units from backend
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Step configuration
  const steps = [
    { id: 0, title: 'Basic Information', icon: FileText },
    { id: 1, title: 'Quantity & Pricing', icon: DollarSign },
    { id: 2, title: 'Supplier Information', icon: Building2 },
    { id: 3, title: 'Images', icon: Image },
  ];

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadInventoryData();
    }
  }, [id]);

  // Fetch categories and units on mount
  useEffect(() => {
    fetchCategoriesAndUnits();
  }, []);

  // Auto-generate SKU for new items
  useEffect(() => {
    if (!isEditMode && !formData.skuCode) {
      const generateUniqueSKU = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        // Format: SKU-YYYYMMDD-HHMMSS-mmm
        return `SKU-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
      };

      setFormData((prev) => ({
        ...prev,
        skuCode: generateUniqueSKU(),
      }));
    }
  }, [isEditMode]);

  const fetchCategoriesAndUnits = async () => {
    setLoadingSettings(true);
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        settingsService.getCategories(),
        settingsService.getUnits(),
      ]);

      // Safely extract categories and units from the response data
      const categoriesData = categoriesRes?.data?.categories || [];
      const unitsData = unitsRes?.data?.units || [];

      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set empty arrays on error to prevent undefined values
      setCategories([]);
      setUnits([]);
      showError('Failed to load categories and units. Please ensure the server is running.');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Auto-save draft functionality
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    if (!isEditMode) {
      loadDraft();
    }
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/inventory/${id}`);
      // Access the nested item data correctly
      const item = response.data.item || response.data.data?.item || response.data;

      setFormData({
        itemName: item.itemName || '',
        skuCode: item.skuCode || '',
        description: item.description || '',
        category: item.category || '',
        tags: item.tags || [],
        currentQuantity: item.currentStock || item.currentQuantity || '',
        minimumQuantity: item.lowStockThreshold || item.minimumQuantity || '',
        unit: item.unit || '',
        purchasePrice: item.purchasePrice || '',
        sellingPrice: item.sellingPrice || '',
        supplierName: item.supplier?.name || '',
        contactPerson: item.supplier?.contactPerson || '',
        supplierEmail: item.supplier?.email || '',
        supplierPhone: item.supplier?.phone || '',
        supplierAddress: item.supplier?.address || '',
        leadTime: item.supplier?.leadTime || '',
        reorderPoint: item.reorderPoint || '',
        minOrderQuantity: item.minOrderQuantity || '',
        images: item.images || [],
        primaryImageIndex: item.primaryImageIndex || 0,
      });

      if (item.images && item.images.length > 0) {
        setImagePreviews(item.images);
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.message || 'Failed to load inventory data',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('inventoryDraft', JSON.stringify(formData));
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('inventoryDraft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        // Merge with defaults to ensure all fields have valid values
        setFormData((prev) => ({
          ...prev,
          ...parsedDraft,
          // Ensure critical fields are never undefined
          category: parsedDraft.category || '',
          unit: parsedDraft.unit || '',
          tags: parsedDraft.tags || [],
          images: parsedDraft.images || [],
          // Preserve auto-generated SKU if draft doesn't have one
          skuCode: parsedDraft.skuCode || prev.skuCode,
        }));
        setAutoSaveStatus('Draft loaded');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('inventoryDraft');
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      // Create previews
      const newPreviews = [];
      const newImages = [];
      let hasErrors = false;

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showWarning(`${file.name} is not an image file`);
          hasErrors = true;
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showWarning(`${file.name} is too large (max 5MB)`);
          hasErrors = true;
          continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);

        // For actual upload, you would upload to server here
        // For now, we'll store the file object
        newImages.push(file);
      }

      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      if (newImages.length > 0) {
        showSuccess(`${newImages.length} image(s) uploaded successfully`);
      }

      // Clear the file input value to allow re-uploading the same file
      e.target.value = '';
    } catch (error) {
      showError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      primaryImageIndex: index,
    }));
  };

  const handleDeleteImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      primaryImageIndex:
        prev.primaryImageIndex === index
          ? 0
          : prev.primaryImageIndex > index
          ? prev.primaryImageIndex - 1
          : prev.primaryImageIndex,
    }));
  };

  // Calculate profit margin
  const calculateProfitMargin = () => {
    const purchase = parseFloat(formData.purchasePrice);
    const selling = parseFloat(formData.sellingPrice);

    if (purchase && selling && purchase > 0) {
      const margin = ((selling - purchase) / purchase) * 100;
      return margin.toFixed(2);
    }
    return '0.00';
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.itemName.trim()) {
          newErrors.itemName = 'Item name is required';
        } else if (formData.itemName.trim().length < 2) {
          newErrors.itemName = 'Item name must be at least 2 characters';
        }

        if (!formData.skuCode.trim()) {
          newErrors.skuCode = 'SKU code is required';
        } else if (formData.skuCode.trim().length < 3) {
          newErrors.skuCode = 'SKU code must be at least 3 characters';
        } else if (!/^[A-Z0-9-_]+$/i.test(formData.skuCode)) {
          newErrors.skuCode = 'SKU code can only contain letters, numbers, hyphens, and underscores';
        }

        if (!formData.category) {
          newErrors.category = 'Category is required';
        }
        break;

      case 1: // Quantity & Pricing
        if (formData.currentQuantity === '' || formData.currentQuantity === null) {
          newErrors.currentQuantity = 'Current quantity is required';
        } else if (isNaN(formData.currentQuantity)) {
          newErrors.currentQuantity = 'Current quantity must be a valid number';
        } else if (parseFloat(formData.currentQuantity) < 0) {
          newErrors.currentQuantity = 'Current quantity cannot be negative';
        }

        if (formData.minimumQuantity === '' || formData.minimumQuantity === null) {
          newErrors.minimumQuantity = 'Minimum quantity is required';
        } else if (isNaN(formData.minimumQuantity)) {
          newErrors.minimumQuantity = 'Minimum quantity must be a valid number';
        } else if (parseFloat(formData.minimumQuantity) < 0) {
          newErrors.minimumQuantity = 'Minimum quantity cannot be negative';
        }

        if (!formData.unit) {
          newErrors.unit = 'Unit is required';
        }

        if (formData.purchasePrice === '' || formData.purchasePrice === null) {
          newErrors.purchasePrice = 'Purchase price is required';
        } else if (isNaN(formData.purchasePrice)) {
          newErrors.purchasePrice = 'Purchase price must be a valid number';
        } else if (parseFloat(formData.purchasePrice) < 0) {
          newErrors.purchasePrice = 'Purchase price cannot be negative';
        } else if (parseFloat(formData.purchasePrice) === 0) {
          newErrors.purchasePrice = 'Purchase price must be greater than 0';
        }

        if (formData.sellingPrice === '' || formData.sellingPrice === null) {
          newErrors.sellingPrice = 'Selling price is required';
        } else if (isNaN(formData.sellingPrice)) {
          newErrors.sellingPrice = 'Selling price must be a valid number';
        } else if (parseFloat(formData.sellingPrice) < 0) {
          newErrors.sellingPrice = 'Selling price cannot be negative';
        } else if (parseFloat(formData.sellingPrice) === 0) {
          newErrors.sellingPrice = 'Selling price must be greater than 0';
        }

        // Optional: Warn if selling price is less than purchase price
        if (parseFloat(formData.sellingPrice) < parseFloat(formData.purchasePrice)) {
          newErrors.sellingPrice = 'Warning: Selling price is less than purchase price (negative margin)';
        }
        break;

      case 2: // Supplier Information
        if (!formData.supplierName.trim()) {
          newErrors.supplierName = 'Supplier name is required';
        } else if (formData.supplierName.trim().length < 2) {
          newErrors.supplierName = 'Supplier name must be at least 2 characters';
        }

        if (formData.supplierEmail && !isValidEmail(formData.supplierEmail)) {
          newErrors.supplierEmail = 'Invalid email format (e.g., example@domain.com)';
        }

        if (formData.supplierPhone && !isValidPhone(formData.supplierPhone)) {
          newErrors.supplierPhone = 'Invalid phone format (minimum 10 digits)';
        }

        if (formData.leadTime && (isNaN(formData.leadTime) || parseFloat(formData.leadTime) < 0)) {
          newErrors.leadTime = 'Lead time must be a positive number';
        }

        if (formData.reorderPoint && (isNaN(formData.reorderPoint) || parseFloat(formData.reorderPoint) < 0)) {
          newErrors.reorderPoint = 'Reorder point must be a positive number';
        }

        if (formData.minOrderQuantity && (isNaN(formData.minOrderQuantity) || parseFloat(formData.minOrderQuantity) <= 0)) {
          newErrors.minOrderQuantity = 'Minimum order quantity must be greater than 0';
        }
        break;

      case 3: // Images
        // Images are optional, no validation required
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Check if current step is valid (for disabling next/submit button)
  const isCurrentStepValid = () => {
    return validateStep(currentStep);
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleStepClick = (stepIndex) => {
    // Allow navigation to previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    }
  };

  // Prevent Enter key from submitting form accidentally
  const handleKeyDown = (e) => {
    // Never allow Enter to do anything on file inputs
    if (e.target.type === 'file') {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      // Allow Enter in textareas for multi-line input
      // On the images step (last step), never auto-submit on Enter
      if (currentStep === steps.length - 1) {
        // Only allow submission if explicitly on the submit button
        if (e.target.type !== 'submit') {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      // Prevent Enter from submitting unless on last step and focused on submit button
      if (currentStep < steps.length - 1 || e.target.type !== 'submit') {
        e.preventDefault();

        // If on a valid step, move to next step when Enter is pressed
        if (currentStep < steps.length - 1 && validateStep(currentStep)) {
          handleNext();
        }
      }
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // CRITICAL: Only allow submission if on the last step
    // This prevents accidental submissions from other steps
    if (currentStep !== steps.length - 1) {
      console.warn('Form submission blocked: not on final step');
      e.stopPropagation();
      return false;
    }

    // Validate all steps
    let isValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        isValid = false;
        setCurrentStep(i);
        break;
      }
    }

    if (!isValid) {
      showError('Please fix all validation errors before submitting');
      setAlert({
        type: 'danger',
        message: 'Please fix all validation errors before submitting',
      });
      return;
    }

    setSubmitLoading(true);
    setAlert(null);

    try {
      // Prepare form data for submission
      const submitData = new FormData();

      // Basic Information
      submitData.append('itemName', formData.itemName);
      submitData.append('skuCode', formData.skuCode);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags));

      // Quantity & Pricing
      submitData.append('currentQuantity', formData.currentQuantity);
      submitData.append('minimumQuantity', formData.minimumQuantity);
      submitData.append('unit', formData.unit);
      submitData.append('purchasePrice', formData.purchasePrice);
      submitData.append('sellingPrice', formData.sellingPrice);

      // Supplier Information
      const supplier = {
        name: formData.supplierName,
        contactPerson: formData.contactPerson,
        email: formData.supplierEmail,
        phone: formData.supplierPhone,
        address: formData.supplierAddress,
        leadTime: formData.leadTime,
      };
      submitData.append('supplier', JSON.stringify(supplier));
      submitData.append('reorderPoint', formData.reorderPoint);
      submitData.append('minOrderQuantity', formData.minOrderQuantity);

      // Images
      formData.images.forEach((image, index) => {
        if (image instanceof File) {
          submitData.append('images', image);
        }
      });
      submitData.append('primaryImageIndex', formData.primaryImageIndex);

      // Make API request
      let response;
      if (isEditMode) {
        response = await api.put(`/inventory/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/inventory', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Clear draft on successful submission
      clearDraft();

      // Show success message
      const successMessage = isEditMode
        ? 'Inventory item updated successfully'
        : 'Inventory item created successfully';

      showSuccess(successMessage);
      setAlert({
        type: 'success',
        message: successMessage,
      });

      // Check for low stock warning
      if (formData.currentQuantity <= formData.minimumQuantity) {
        showWarning(`Stock level is at or below minimum threshold for ${formData.itemName}`);
      }

      // Redirect after short delay
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      const errorMessage = error.message || 'Failed to save inventory item';
      showError(errorMessage);
      setAlert({
        type: 'danger',
        message: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      clearDraft();
      navigate('/inventory');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isEditMode
              ? 'Update the details of your inventory item'
              : 'Fill in the details to add a new item to your inventory'}
          </p>

          {/* Prominent SKU Display */}
          {formData.skuCode && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Item Number</span>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">{formData.skuCode}</p>
              </div>
            </div>
          )}

          {autoSaveStatus && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              {autoSaveStatus}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between min-w-max sm:min-w-0">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex flex-col items-center cursor-pointer px-2 sm:px-0 ${
                    index <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => handleStepClick(index)}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all ${
                      index === currentStep
                        ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                        : index < currentStep
                        ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                        : 'border-gray-300 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {React.createElement(step.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                  </div>
                  <span
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center ${
                      index <= currentStep
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 sm:mx-2 rounded transition-all min-w-[20px] ${
                      index < currentStep
                        ? 'bg-green-600 dark:bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              variant={alert.type}
              dismissible
              onDismiss={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>

                <Input
                  label="Item Name"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  error={errors.itemName}
                  required
                  fullWidth
                />

                <Input
                  label="SKU"
                  name="skuCode"
                  value={formData.skuCode}
                  onChange={handleChange}
                  placeholder="Auto-generated SKU"
                  error={errors.skuCode}
                  helperText={isEditMode ? "Unique identifier for this item" : "Auto-generated unique identifier"}
                  required
                  fullWidth
                  disabled={!isEditMode}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
                      <Link
                        to="/settings"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Categories
                      </Link>
                    )}
                  </div>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categories}
                    placeholder="Select category"
                    error={errors.category}
                    required
                    fullWidth
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Categories are managed by administrators
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={addTag}
                      placeholder="Type tag and press Enter"
                      className="block flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Quantity & Pricing */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quantity & Pricing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Current Quantity"
                    type="number"
                    name="currentQuantity"
                    value={formData.currentQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.currentQuantity}
                    required
                    fullWidth
                    min="0"
                  />

                  <Input
                    label="Minimum Quantity"
                    type="number"
                    name="minimumQuantity"
                    value={formData.minimumQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.minimumQuantity}
                    helperText="Alert threshold for low stock"
                    required
                    fullWidth
                    min="0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    {isAdmin && (
                      <Link
                        to="/settings"
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Units
                      </Link>
                    )}
                  </div>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    options={units}
                    placeholder="Select unit"
                    error={errors.unit}
                    required
                    fullWidth
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Units are managed by administrators
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Purchase Price"
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.purchasePrice}
                    required
                    fullWidth
                    min="0"
                    step="0.01"
                  />

                  <Input
                    label="Selling Price"
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.sellingPrice}
                    required
                    fullWidth
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Profit Margin Display */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Profit Margin
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {calculateProfitMargin()}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Calculated based on purchase and selling prices
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Supplier Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Supplier Information
                </h2>

                <Input
                  label="Supplier Name"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  error={errors.supplierName}
                  required
                  fullWidth
                />

                <Input
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
                  fullWidth
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email"
                    type="email"
                    name="supplierEmail"
                    value={formData.supplierEmail}
                    onChange={handleChange}
                    placeholder="supplier@example.com"
                    error={errors.supplierEmail}
                    fullWidth
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    name="supplierPhone"
                    value={formData.supplierPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    error={errors.supplierPhone}
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Address
                  </label>
                  <textarea
                    name="supplierAddress"
                    value={formData.supplierAddress}
                    onChange={handleChange}
                    placeholder="Enter supplier address"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Lead Time (days)"
                    type="number"
                    name="leadTime"
                    value={formData.leadTime}
                    onChange={handleChange}
                    placeholder="0"
                    helperText="Delivery time"
                    fullWidth
                    min="0"
                  />

                  <Input
                    label="Reorder Point"
                    type="number"
                    name="reorderPoint"
                    value={formData.reorderPoint}
                    onChange={handleChange}
                    placeholder="0"
                    helperText="When to reorder"
                    fullWidth
                    min="0"
                  />

                  <Input
                    label="Min Order Quantity"
                    type="number"
                    name="minOrderQuantity"
                    value={formData.minOrderQuantity}
                    onChange={handleChange}
                    placeholder="0"
                    helperText="MOQ"
                    fullWidth
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <div
                className="space-y-6"
                onClick={(e) => {
                  // Prevent any clicks in the images section from bubbling to form
                  e.stopPropagation();
                }}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Images
                </h2>

                {/* Upload Button */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Upload Images
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        // Prevent label click from bubbling up and triggering form submission
                        e.stopPropagation();
                      }}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        onKeyDown={(e) => {
                          // Absolutely prevent Enter key on file input
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Uploaded Images ({imagePreviews.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className={`relative group rounded-lg overflow-hidden border-2 ${
                            formData.primaryImageIndex === index
                              ? 'border-blue-600 dark:border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <img
                            src={getImageUrl(preview)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />

                          {/* Primary Badge */}
                          {formData.primaryImageIndex === index && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {formData.primaryImageIndex !== index && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleSetPrimaryImage(index);
                                }}
                                className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                                title="Set as primary"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteImage(index);
                              }}
                              className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No images uploaded yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex gap-3 order-2 sm:order-1">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handlePrevious} fullWidth className="sm:w-auto flex-1 sm:flex-none">
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-3 order-1 sm:order-2">
              <Button type="button" variant="ghost" onClick={handleCancel} fullWidth className="sm:w-auto flex-1 sm:flex-none">
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  fullWidth
                  className="sm:w-auto flex-1 sm:flex-none"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitLoading}
                  disabled={submitLoading}
                  fullWidth
                  className="sm:w-auto flex-1 sm:flex-none"
                >
                  {isEditMode ? 'Update Item' : 'Create Item'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
