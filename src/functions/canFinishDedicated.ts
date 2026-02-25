import { IDedicationsByUserId } from '../interfaces/dedications/dedications.interfaces'

/**
 * 
 *
 *
 * @param {IDedicationsByUserId[]} data 
 *                                      
 *
 * @returns {boolean} 
 *                   
 *
 * @example
 *
 * const dedications = [
 *   { ..., week: 01-01-2024, dedicated: 50 },
 *   { ..., week: 01-01-2024, dedicated: 50 }
 * ];
 *
 * const result = canFinishDedicated(dedications);
 * // result sería true porque las semanas son iguales y el total de dedicación es 100%
 *
 * const invalidDedications = [
 *   { ..., week: 01-01-2024, dedicated: 50 },
 *   { ..., week: 07-01-2024, dedicated: 50 }
 * ];
 *
 * const invalidResult = canFinishDedicated(invalidDedications);
 * // invalidResult sería false porque las semanas no son iguales
 */
export const canFinishDedicated = (data: IDedicationsByUserId[]) => {
  if (data.length === 0) return false


  const sameWeek = data.every((d) => d.week === data[0].week)
  if (!sameWeek) return false

  const hasDecimals = data.some((d) => d.dedicated <= 1)

  const total = data.reduce((acc, d) => acc + d.dedicated, 0)

  const EPS = 1e-6
  return hasDecimals ? Math.abs(total - 1) < EPS : Math.abs(total - 100) < EPS
}

