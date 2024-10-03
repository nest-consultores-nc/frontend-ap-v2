/**
 * Removes dollar signs, dots, and any non-numeric characters from the 'amount' string,
 * but allows a single negative sign at the beginning.
 *
 * @param amount - A string representing the amount, which may include a dollar sign, dots, and a negative sign.
 * @returns A string with only numeric characters and an optional leading negative sign.
 */
export const sanitizeAmount = (amount: string): string => {
  // Permitir solo dígitos y un signo negativo al principio
  return amount.replace(/(?!^-)[^\d]/g, '')
}
