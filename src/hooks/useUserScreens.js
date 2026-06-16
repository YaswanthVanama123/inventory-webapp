import { useState, useEffect, useMemo, useCallback } from 'react';
import screenPermissionService from '../services/screenPermissionService';

const normalize = (path) => (path ?? '').split('?')[0].replace(/\/$/, '');

export const useUserScreens = () => {
  const [userScreens, setUserScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserScreens = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUserScreens();
  }, [fetchUserScreens]);

  const normalizedPaths = useMemo(
    () => userScreens.map((screen) => normalize(screen.path)).filter(Boolean),
    [userScreens]
  );

  const exactMatchSet = useMemo(() => new Set(normalizedPaths), [normalizedPaths]);

  const hasAccessToScreen = useCallback((path) => {
    if (!path) return false;
    const target = normalize(path);
    if (!target) return false;
    if (exactMatchSet.has(target)) return true;
    for (const screenPath of normalizedPaths) {
      if (screenPath && target.startsWith(`${screenPath}/`)) return true;
    }
    return false;
  }, [exactMatchSet, normalizedPaths]);

  const hasAccessToAnySubScreen = useCallback((submenu) => {
    if (!submenu || submenu.length === 0) return false;
    return submenu.some((item) => hasAccessToScreen(item.path));
  }, [hasAccessToScreen]);

  return {
    userScreens,
    loading,
    error,
    hasAccessToScreen,
    hasAccessToAnySubScreen,
    refetch: fetchUserScreens,
  };
};
