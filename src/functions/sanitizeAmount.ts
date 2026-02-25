/**
 * @param amount - 
 * @returns 
 */
export const sanitizeAmount = (amount: string): string => {

  return amount.replace(/(?!^-)[^\d]/g, '')
}
