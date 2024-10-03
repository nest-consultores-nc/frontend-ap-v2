/**
 * Formats a number into Chilean Peso (CLP) currency format.
 *
 * @param value - The number to format, can be a string or a number.
 * @returns A string representing the formatted number as Chilean Peso currency.
 */
export const formatedNumber = (value: number | string): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(Number(value))
