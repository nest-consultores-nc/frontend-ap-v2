/**
 * Formats a date string into a human-readable format.
 *
 * @param {Date} dateString - The date string to be formatted.
 * @return {string} The formatted date string in the format 'MM/DD/YYYY HH:mm:ss AM/PM'.
 */
export function formatDateTime(dateString: Date) {
  const date = new Date(dateString)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

/**
 * Formats a date (either a Date object or a string) into the 'YYYY-MM-DD' (ISO) format.
 *
 * @param {Date | string} inputDate - The date to be formatted. Can be a Date object or a string.
 * @return {string} The formatted date string in the 'YYYY-MM-DD' format.
 *
 * @example
 * const today = new Date();
 * const formattedDate = formatDateToISO(today); // Example output: '2024-10-01'
 *
 * @example
 * const dateString = '2024-09-15';
 * const formattedDate = formatDateToISO(dateString); // Example output: '2024-09-15'
 */
export function formatDateToISO(inputDate: Date | string): string {
  const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}
