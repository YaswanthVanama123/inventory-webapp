/**
 * Date formatting utilities with Virginia US timezone (America/New_York)
 * All dates are automatically converted to Eastern Time (ET)
 */

const VIRGINIA_TIMEZONE = 'America/New_York';

/**
 * Format date to localized string in Virginia timezone
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: VIRGINIA_TIMEZONE,
      ...options
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date and time to localized string in Virginia timezone
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: VIRGINIA_TIMEZONE,
      ...options
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only in Virginia timezone
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: VIRGINIA_TIMEZONE,
      ...options
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Format date with full details including timezone abbreviation
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string with timezone
 */
export const formatDateTimeFull = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: VIRGINIA_TIMEZONE,
      timeZoneName: 'short'
    }).format(dateObj);
  } catch (error) {
    console.error('Full DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date for display in tables (short format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      timeZone: VIRGINIA_TIMEZONE
    }).format(dateObj);
  } catch (error) {
    console.error('Short date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date and time for display in tables (compact format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTimeShort = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: VIRGINIA_TIMEZONE
    }).format(dateObj);
  } catch (error) {
    console.error('Short DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * Calculated based on Virginia timezone
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;

    return formatDate(dateObj);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Legacy compatibility - converts date to Virginia timezone locale string
 * @deprecated Use formatDate or formatDateTime instead
 */
export const toVirginiaTime = (date) => {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDateTime(dateObj);
  } catch (error) {
    console.error('Virginia time conversion error:', error);
    return 'Invalid Date';
  }
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateTimeFull,
  formatDateShort,
  formatDateTimeShort,
  formatRelativeTime,
  toVirginiaTime,
  VIRGINIA_TIMEZONE
};
