import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';

const ImageUpload = ({
  images = [],
  onImagesChange,
  primaryImageIndex = 0,
  onPrimaryImageChange,
  maxImages = 5,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showProgress = true,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);

  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState({});

  // State for preview images
  const [previews, setPreviews] = useState([]);

  // Initialize previews from existing images
  useEffect(() => {
    if (images && images.length > 0) {
      const newPreviews = images.map((img) => {
        // If it's a File object, create blob URL
        if (img instanceof File) {
          return {
            url: URL.createObjectURL(img),
            file: img,
            name: img.name,
            size: img.size,
          };
        }
        // If it's a URL string
        return {
          url: img,
          file: null,
          name: 'Existing image',
          size: 0,
        };
      });
      setPreviews(newPreviews);
    } else {
      setPreviews([]);
    }
  }, [images]);

  // Validate file
  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes
        .map((type) => type.split('/')[1])
        .join(', ');
      errors.push(
        `Invalid file type. Allowed types: ${allowedExtensions.toUpperCase()}`
      );
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      errors.push(`File size exceeds ${maxSizeInMB}MB limit`);
    }

    return errors;
  };

  // Process and add files
  const processFiles = async (files) => {
    const fileArray = Array.from(files);

    // Check total images limit
    if (images.length + fileArray.length > maxImages) {
      showToast(
        `You can only upload up to ${maxImages} images. Currently: ${images.length}`,
        'warning'
      );
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    // Validate each file
    fileArray.forEach((file) => {
      const errors = validateFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors });
      }
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, errors }) => {
        showToast(`${file.name}: ${errors.join(', ')}`, 'error');
      });
    }

    // Process valid files
    if (validFiles.length > 0) {
      // Simulate upload progress
      const newProgress = {};
      validFiles.forEach((file, index) => {
        newProgress[file.name] = 0;

        // Simulate progressive upload
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              return prev;
            }
            return {
              ...prev,
              [file.name]: Math.min(currentProgress + 10, 100),
            };
          });
        }, 100);
      });

      setUploadProgress(newProgress);

      // Add files to images array
      const updatedImages = [...images, ...validFiles];
      onImagesChange(updatedImages);

      // Clear progress after completion
      setTimeout(() => {
        setUploadProgress({});
        showToast(
          `Successfully uploaded ${validFiles.length} image${
            validFiles.length > 1 ? 's' : ''
          }`,
          'success'
        );
      }, 1500);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Handle remove image
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);

    // Update primary image index if needed
    if (primaryImageIndex === index) {
      onPrimaryImageChange(0);
    } else if (primaryImageIndex > index) {
      onPrimaryImageChange(primaryImageIndex - 1);
    }

    showToast('Image removed', 'info');
  };

  // Handle set primary image
  const handleSetPrimary = (index) => {
    onPrimaryImageChange(index);
    showToast('Primary image updated', 'success');
  };

  // Get file size display
  const getFileSizeDisplay = (bytes) => {
    if (bytes === 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-102'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <div className="space-y-3">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <div
              className={`
              p-3 rounded-full
              ${
                isDragging
                  ? 'bg-purple-100 dark:bg-purple-800'
                  : 'bg-blue-100 dark:bg-blue-800'
              }
            `}
            >
              <svg
                className={`w-10 h-10 ${
                  isDragging
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
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
            </div>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              {isDragging ? (
                <span className="text-purple-600 dark:text-purple-400">
                  Drop your images here
                </span>
              ) : (
                <>
                  <span className="text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG, WEBP up to {maxSizeInMB}MB
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {images.length} / {maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {showProgress && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div
              key={fileName}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Uploaded Images ({previews.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className={`
                  relative group rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${
                    primaryImageIndex === index
                      ? 'border-purple-500 ring-2 ring-purple-300 dark:ring-purple-700 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }
                `}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Primary Badge */}
                {primaryImageIndex === index && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Primary
                    </span>
                  </div>
                )}

                {/* File Info */}
                {preview.file && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center truncate">
                    {getFileSizeDisplay(preview.size)}
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {primaryImageIndex !== index && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(index);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg transition-colors duration-200 flex items-center gap-1"
                      title="Set as primary"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg transition-colors duration-200 flex items-center gap-1"
                    title="Remove image"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {previews.length === 0 && Object.keys(uploadProgress).length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
