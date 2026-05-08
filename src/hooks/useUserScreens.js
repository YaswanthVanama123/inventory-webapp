import { useState, useEffect } from 'react';
import screenPermissionService from '../services/screenPermissionService';

export const useUserScreens = () => {
  const [userScreens, setUserScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserScreens();
  }, []);

  const fetchUserScreens = async () => {
    try {
      setLoading(true);
      const result = await screenPermissionService.getMyScreens();
      if (result.success) {
        setUserScreens(result.data);
      }
    } catch (err) {
      console.error('Error fetching user screens:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const hasAccessToScreen = (path) => {
    if (!path) return false;

    // Normalize paths for comparison (remove query params and trailing slashes)
    const normalizedPath = path.split('?')[0].replace(/\/$/, '');

    return userScreens.some(screen => {
      const screenPath = screen.path.split('?')[0].replace(/\/$/, '');

      // Exact match
      if (screenPath === normalizedPath) return true;

      // Child route match (e.g., /inventory/:id matches /inventory)
      if (normalizedPath.startsWith(screenPath + '/') && screenPath !== '') {
        return true;
      }

      return false;
    });
  };

  const hasAccessToAnySubScreen = (submenu) => {
    // Check if user has access to any screen in the submenu
    if (!submenu || submenu.length === 0) return false;
    return submenu.some(item => hasAccessToScreen(item.path));
  };

  return {
    userScreens,
    loading,
    error,
    hasAccessToScreen,
    hasAccessToAnySubScreen,
    refetch: fetchUserScreens
  };
};
