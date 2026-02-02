import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


export function useURLParams(params, defaultValues = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const newParams = {};

    Object.entries(params).forEach(([key, value]) => {
      const defaultValue = defaultValues[key];
      
      if (value && value !== defaultValue) {
        newParams[key] = String(value);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [Object.values(params).join(',')]);

  return { searchParams, setSearchParams };
}

export default useURLParams;
