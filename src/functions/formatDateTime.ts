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
