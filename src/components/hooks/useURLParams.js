import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for syncing state with URL search parameters
 * @param {Object} params - The parameters to sync with URL
 * @param {Object} defaultValues - Default values for parameters
 */
export function useURLParams(params, defaultValues = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const newParams = {};

    Object.entries(params).forEach(([key, value]) => {
      const defaultValue = defaultValues[key];
      // Only add to URL if value exists and is different from default
      if (value && value !== defaultValue) {
        newParams[key] = String(value);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [Object.values(params).join(',')]);

  return { searchParams, setSearchParams };
}

export default useURLParams;
