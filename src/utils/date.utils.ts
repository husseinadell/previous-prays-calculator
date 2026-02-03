/**
 * Parse a date string to UTC midnight, or return today's date in UTC if no date provided
 * @param date - Optional date string (YYYY-MM-DD format)
 * @returns Date object set to UTC midnight
 */
export const parseDateOrToday = (date?: string): Date => {
  if (date) {
    // Parse date string and set to UTC midnight
    return new Date(date + 'T00:00:00.000Z');
  }
  // Get today's date in UTC and set to midnight UTC
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Parse a date string to end of day in UTC (23:59:59.999)
 * @param dateStr - Date string (YYYY-MM-DD format)
 * @returns Date object set to end of day in UTC
 */
export const parseDateToUTCEndOfDay = (dateStr: string): Date => {
  return new Date(dateStr + 'T23:59:59.999Z');
};
