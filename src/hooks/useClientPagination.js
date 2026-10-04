import { useState, useEffect, useMemo } from 'react';

export default function useClientPagination(items, { pageSize = 20, resetKey } = {}) {
  const list = Array.isArray(items) ? items : [];
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / size));

  useEffect(() => {
    setPage(1);
  }, [resetKey, size]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  }, [list, page, size]);

  return {
    page,
    setPage,
    pageSize: size,
    setPageSize: setSize,
    total,
    totalPages,
    pageItems,
  };
}
