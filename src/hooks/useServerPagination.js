import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Server-side pagination. Calls `fetchPage({ page, limit })` (which should hit
 * the backend with those query params) and exposes the returned slice plus
 * `total`/`totalPages` for the shared <Pagination /> component.
 *
 * `fetchPage` must resolve to `{ items, total, pages, extra? }`:
 *   - items: the current page rows
 *   - total: full filtered count (for the result-count label)
 *   - pages: total page count
 *   - extra: optional side payload (e.g. aggregate totals/stats) surfaced as `extra`
 *
 * @param {(args:{page:number,limit:number}) => Promise<object>} fetchPage
 * @param {object} [opts]
 * @param {number} [opts.pageSize=20]
 * @param {*} [opts.resetKey] change this (search text / tab) to jump back to page 1
 */
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

  // Keep the latest fetcher without making it a fetch trigger.
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const refetch = useCallback(() => setReloadFlag((f) => f + 1), []);

  // Jump back to the first page when the filter identity or page size changes.
  // (No-op re-set when already on page 1, so it doesn't double-fetch the common case.)
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
        if (active) setLoading(false);
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
    error,
    refetch,
  };
}
