/**
 * Añade un número específico de días a una fecha dada.
 * @param {string} dateString - La fecha de inicio en formato YYYY-MM-DD.
 * @param {number} days - El número de días a añadir.
 * @returns {string} - La nueva fecha en formato YYYY-MM-DD.
 */
export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Meses de 0-11, sumamos 1
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
