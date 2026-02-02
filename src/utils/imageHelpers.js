
export const getImageUrl = (image) => {
  
  if (typeof image === 'string' && image.startsWith('blob:')) {
    return image;
  }

  
  if (image === '/placeholder-product.png' || !image) {
    return '/placeholder-product.png';
  }

  
  const path = typeof image === 'object' ? image?.path : image;

  if (!path) {
    return '/placeholder-product.png';
  }

  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  
  if (path.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${path}`;
  }

  
  return path || '/placeholder-product.png';
};


export const getImageId = (image) => {
  if (typeof image === 'object' && image?._id) {
    return image._id;
  }
  return null;
};


export const isImgBBUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('ibb.co') || url.includes('i.ibb.co');
};


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
