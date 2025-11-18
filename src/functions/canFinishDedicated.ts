import { IDedicationsByUserId } from '../interfaces/dedications/dedications.interfaces'

/**
 * Valida si es posible finalizar la dedicación de un conjunto de usuarios.
 *
 * Esta función verifica que todas las semanas en el conjunto de datos sean las mismas
 * y que la suma de las dedicaciones de todos los usuarios sea exactamente 100%.
 *
 * @param {IDedicationsByUserId[]} data - Un array de objetos que contienen la información de las dedicaciones de los usuarios.
 *                                         Cada objeto debe incluir el número de semana (`week`) y el porcentaje dedicado (`dedicated`).
 *
 * @returns {boolean} - Retorna `true` si todas las semanas son las mismas y el total de dedicación es exactamente 100%.
 *                      Retorna `false` en caso contrario o si el array está vacío.
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

  // 1) Todas las semanas deben ser iguales
  const sameWeek = data.every((d) => d.week === data[0].week)
  if (!sameWeek) return false

  // 2) Normalizar: si algún 'dedicated' es <= 1, asumimos decimales (0–1);
  //    de lo contrario, asumimos porcentajes (0–100).
  const hasDecimals = data.some((d) => d.dedicated <= 1)

  const total = data.reduce((acc, d) => acc + d.dedicated, 0)

  // 3) Comparación con tolerancia para evitar errores de coma flotante
  const EPS = 1e-6
  return hasDecimals ? Math.abs(total - 1) < EPS : Math.abs(total - 100) < EPS
}

