import { useState, useEffect, useCallback, useRef } from 'react';

export default function useServerPagination(fetchPage, { pageSize = 20, resetKey } = {}) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const refetch = useCallback(() => setReloadFlag((f) => f + 1), []);

  useEffect(() => {
    setPage(1);
  }, [resetKey, size]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.resolve(fetchRef.current({ page, limit: size }))
      .then((res) => {
        if (!active) return;
        const list = res?.items || res?.data || [];
        setItems(Array.isArray(list) ? list : []);
        setTotal(res?.total ?? list.length);
        setTotalPages(res?.pages || 1);
        setExtra(res?.extra ?? null);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setHasLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [page, size, resetKey, reloadFlag]);

  return {
    items,
    page,
    setPage,
    pageSize: size,
    setPageSize: setSize,
    total,
    totalPages,
    extra,
    loading,
    initialLoading: loading && !hasLoaded,
    error,
    refetch,
  };
}
