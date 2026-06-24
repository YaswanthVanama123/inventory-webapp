import { useState, useEffect, useMemo } from 'react';

/**
 * Client-side pagination over an already-fetched array. Pairs with the shared
 * <Pagination /> component: feed it `page`, `totalPages`, `total`, `pageSize`
 * and render `pageItems` instead of the full list. Keeps the DOM small on big
 * datasets without changing the fetch (server-side ?page=&limit= is a later step).
 *
 * @param {Array} items the full (already filtered) array to paginate
 * @param {object} [opts]
 * @param {number} [opts.pageSize=20] rows per page
 * @param {*} [opts.resetKey] change this (e.g. the search term / active tab) to jump back to page 1
 * @returns {{page:number,setPage:Function,pageSize:number,setPageSize:Function,total:number,totalPages:number,pageItems:Array}}
 */
export default function useClientPagination(items, { pageSize = 20, resetKey } = {}) {
  const list = Array.isArray(items) ? items : [];
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / size));

  // Jump back to the first page when the dataset identity (search/tab) or page size changes.
  useEffect(() => {
    setPage(1);
  }, [resetKey, size]);

  // Never leave the user stranded past the last page after the list shrinks.
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
