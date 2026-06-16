const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const numberFormatter = new Intl.NumberFormat('en-US');

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(Number(amount));
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '0';
  return numberFormatter.format(Number(value));
};

export const formatDateShort = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTimeShort = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const STATUS_BADGE_VARIANTS = {
  complete: 'success',
  completed: 'success',
  paid: 'success',
  active: 'success',
  approved: 'success',
  delivered: 'success',
  processing: 'info',
  pending: 'warning',
  partial: 'warning',
  draft: 'secondary',
  cancelled: 'danger',
  canceled: 'danger',
  rejected: 'danger',
  failed: 'danger',
  overdue: 'danger',
  inactive: 'secondary',
};

export const getStatusBadgeVariant = (status) => {
  if (!status) return 'secondary';
  const key = String(status).toLowerCase().trim();
  return STATUS_BADGE_VARIANTS[key] || 'secondary';
};
