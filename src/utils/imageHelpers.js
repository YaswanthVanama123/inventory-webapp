/**
 * Get the full URL for an image
 * Handles ImgBB URLs, local uploads, blob URLs, and placeholders
 * @param {string|object} image - Image path (string) or image object with path property
 * @returns {string} Full image URL
 */
export const getImageUrl = (image) => {
  // If it's a blob URL (from file input), return as is
  if (typeof image === 'string' && image.startsWith('blob:')) {
    return image;
  }

  // If it's a placeholder, return as is
  if (image === '/placeholder-product.png' || !image) {
    return '/placeholder-product.png';
  }

  // Extract path from image object or use string directly
  const path = typeof image === 'object' ? image?.path : image;

  if (!path) {
    return '/placeholder-product.png';
  }

  // If it's already a full URL (from ImgBB or other cloud storage), use it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // For legacy local images stored on the server
  if (path.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${path}`;
  }

  // Default return
  return path || '/placeholder-product.png';
};

/**
 * Get the image ID from an image object
 * @param {string|object} image - Image object or string
 * @returns {string|null} Image ID or null
 */
export const getImageId = (image) => {
  if (typeof image === 'object' && image?._id) {
    return image._id;
  }
  return null;
};

/**
 * Check if an image URL is from ImgBB
 * @param {string} url - Image URL
 * @returns {boolean} True if URL is from ImgBB
 */
export const isImgBBUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('ibb.co') || url.includes('i.ibb.co');
};

/**
 * Get ImgBB metadata from an image object
 * @param {object} image - Image object
 * @returns {object|null} ImgBB metadata or null
 */
export const getImgBBMetadata = (image) => {
  if (typeof image !== 'object' || !image) return null;

  return {
    id: image.imgbbId || null,
    url: image.url || null,
    displayUrl: image.display_url || image.path || null,
    deleteUrl: image.deleteUrl || null,
    width: image.width || null,
    height: image.height || null,
    size: image.size || null,
    filename: image.filename || null,
    mimetype: image.mimetype || null,
  };
};
