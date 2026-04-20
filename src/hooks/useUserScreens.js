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
    // Check if user has access to this path
    return userScreens.some(screen => screen.path === path);
  };

  const hasAccessToAnySubScreen = (submenu) => {
    // Check if user has access to any screen in the submenu
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
