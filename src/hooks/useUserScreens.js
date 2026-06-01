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

    const normalizedPath = path.split('?')[0].replace(/\/$/, '');

    return userScreens.some(screen => {
      const screenPath = screen.path.split('?')[0].replace(/\/$/, '');

      if (screenPath === normalizedPath) return true;

      if (normalizedPath.startsWith(screenPath + '/') && screenPath !== '') {
        return true;
      }

      return false;
    });
  };

  const hasAccessToAnySubScreen = (submenu) => {
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
