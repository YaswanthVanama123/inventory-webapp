import React, { useState, useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import { itemCaseQuantityService } from '../../services/itemCaseQuantityService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import useDebounce from '../../hooks/useDebounce';
import useServerPagination from '../../hooks/useServerPagination';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

const FILTERS = [
  { key: 'all', label: 'All Items' },
  { key: 'mapped', label: 'Mapped' },
  { key: 'unmapped', label: 'Unmapped' },
  { key: 'bulk', label: 'Bulk (Case > 1)' },
];

const CaseQuantityMapping = () => {
  const { showSuccess, showError, showWarning } = useContext(ToastContext);

  const [saving, setSaving] = useState(false);
  // Local edits keyed by SKU. Survives page changes so Save All keeps working.
  const [edits, setEdits] = useState({});
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, mapped: 0, unmapped: 0, bulk: 0 });

  const {
    items: pageItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    extra,
    loading,
    refetch,
  } = useServerPagination(
    ({ page, limit }) =>
      itemCaseQuantityService
        .getPurchasedItems({
          page,
          limit,
          search: debouncedSearch || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        })
        .then((res) => ({
          items: res.items || [],
          total: res.pagination?.total ?? res.total ?? 0,
          pages: res.pagination?.totalPages ?? 1,
          extra: res.stats || null,
        })),
    { pageSize: 20, resetKey: `${debouncedSearch}|${filterStatus}` }
  );

  React.useEffect(() => {
    if (extra) setStats(extra);
  }, [extra]);

  // Page rows with any unsaved local edits applied on top.
  const items = pageItems.map((item) =>
    edits[item.sku] ? { ...item, ...edits[item.sku] } : item
  );

  const markEdited = (sku, patch) => {
    setEdits((prev) => ({ ...prev, [sku]: { ...prev[sku], ...patch } }));
    setPendingChanges((prev) => new Set([...prev, sku]));
  };

  const getItem = (sku) => {
    const base = pageItems.find((i) => i.sku === sku);
    const edit = edits[sku];
    if (base) return { ...base, ...(edit || {}) };
    return edit ? { sku, ...edit } : null;
  };

  const clearEdit = (sku) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
    setPendingChanges((prev) => {
      const next = new Set(prev);
      next.delete(sku);
      return next;
    });
  };

  const reload = () => {
    setEdits({});
    setPendingChanges(new Set());
    refetch();
  };

  const buildPayload = (item) => ({
    sku: item.sku,
    itemName: item.itemName || '',
    unitsPerCase: Number(item.unitsPerCase) || 1,
    purchaseUnitLabel: item.purchaseUnitLabel || 'Case',
    sellingUnitLabel: item.sellingUnitLabel || 'Each',
    notes: item.notes || '',
  });

  const saveMapping = async (sku) => {
    const item = getItem(sku);
    if (!item) return;
    const unitsPerCase = Number(item.unitsPerCase);
    if (!Number.isFinite(unitsPerCase) || unitsPerCase < 1) {
      showError('Units per case must be a whole number of 1 or more');
      return;
    }
    try {
      setSaving(true);
      await itemCaseQuantityService.saveMapping(buildPayload(item));
      showSuccess(`Case quantity saved for ${sku}`);
      clearEdit(sku);
      refetch();
    } catch (error) {
      showError('Failed to save case quantity: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    if (pendingChanges.size === 0) {
      showWarning('No changes to save');
      return;
    }
    const payload = Array.from(pendingChanges)
      .map((sku) => getItem(sku))
      .filter(Boolean)
      .filter((item) => Number(item.unitsPerCase) >= 1)
      .map(buildPayload);

    if (payload.length === 0) {
      showError('Units per case must be 1 or more');
      return;
    }
    try {
      setSaving(true);
      const result = await itemCaseQuantityService.bulkSaveMappings(payload);
      const failed = result?.data?.failed || [];
      if (failed.length > 0) {
        showError(`${failed.length} item(s) failed to save`);
      } else {
        showSuccess(`Saved ${payload.length} case quantities`);
      }
      setEdits({});
      setPendingChanges(new Set());
      refetch();
    } catch (error) {
      showError('Failed to save changes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMapping = async (sku) => {
    if (!window.confirm(`Reset ${sku} back to 1 unit per purchase unit?`)) return;
    try {
      await itemCaseQuantityService.deleteMapping(sku);
      showSuccess(`Case quantity removed for ${sku}`);
      clearEdit(sku);
      refetch();
    } catch (error) {
      showError('Failed to remove case quantity: ' + error.message);
    }
  };

  const statCards = [
    {
      label: 'Purchased Items',
      value: stats.total,
      valueClass: 'text-gray-900 dark:text-white',
      hint: 'Unique SKUs across all purchase orders',
    },
    {
      label: 'Mapped',
      value: stats.mapped,
      valueClass: 'text-emerald-600 dark:text-emerald-500',
      hint: `${stats.total > 0 ? Math.round((stats.mapped / stats.total) * 100) : 0}% completion`,
    },
    {
      label: 'Unmapped',
      value: stats.unmapped,
      valueClass: 'text-amber-600 dark:text-amber-500',
      hint: 'Counted as 1 unit per purchase unit',
    },
    {
      label: 'Bulk Items',
      value: stats.bulk,
      valueClass: 'text-blue-600 dark:text-blue-500',
      hint: 'Bought by the case / multi-pack',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Case Quantity Mapping
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Set how many sellable units come in one purchased case for every item on a purchase
          order. Stock adds the full case (e.g. 1 case &times; 200 = 200 units) while a sale or
          truck checkout only removes a single unit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {card.label}
            </p>
            <p className={`text-3xl font-bold ${card.valueClass}`}>{card.value ?? 0}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="sticky top-0 z-20">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                key={filter.key}
                variant={filterStatus === filter.key ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search SKU, item or category..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={reload}
              icon={<ArrowPathIcon className="w-5 h-5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={saveAllChanges}
              disabled={pendingChanges.size === 0 || saving}
            >
              Save All ({pendingChanges.size})
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['#', 'SKU', 'Purchased Item', 'Status', 'Units per Case', 'Purchase Unit', 'Selling Unit', 'Purchased', 'Notes', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading purchased items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No purchased items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const unitsPerCase = Number(item.unitsPerCase) || 1;
                  const stockUnits = (item.countedCases || 0) * unitsPerCase;
                  return (
                    <tr
                      key={item.sku}
                      className={unitsPerCase > 1 ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {item.sku}
                        </span>
                        {item.source && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase mt-0.5">
                            {item.source}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {item.itemName || '-'}
                        </div>
                        {item.categoryItemName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            → {item.categoryItemName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.isMapped ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircleIcon className="w-4 h-4" />
                            Mapped
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <XCircleIcon className="w-4 h-4" />
                            Default (1)
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.unitsPerCase ?? 1}
                          onChange={(e) =>
                            markEdited(item.sku, {
                              unitsPerCase: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-24"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Input
                          type="text"
                          placeholder="Case"
                          value={item.purchaseUnitLabel || ''}
                          onChange={(e) => markEdited(item.sku, { purchaseUnitLabel: e.target.value })}
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Input
                          type="text"
                          placeholder="Each"
                          value={item.sellingUnitLabel || ''}
                          onChange={(e) => markEdited(item.sku, { sellingUnitLabel: e.target.value })}
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {stockUnits} units
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.countedCases || 0} × {unitsPerCase}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Input
                          type="text"
                          placeholder="Add notes..."
                          value={item.notes || ''}
                          onChange={(e) => markEdited(item.sku, { notes: e.target.value })}
                          className="w-full min-w-[140px]"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => saveMapping(item.sku)}
                            disabled={saving}
                          >
                            Save
                          </Button>
                          {item.isMapped && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteMapping(item.sku)}
                              icon={<TrashIcon className="w-4 h-4" />}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={total}
              itemsPerPage={pageSize}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              showPageSize={true}
              showResultCount={true}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaseQuantityMapping;
