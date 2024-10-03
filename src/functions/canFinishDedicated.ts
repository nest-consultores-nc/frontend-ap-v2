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
  return (
    data.length > 0 &&
    // Validar que todas las semanas sean las mismas
    data.every((dedication) => dedication.week === data[0].week) &&
    // Validar que el total de dedicación sea 100%
    data.reduce((total, { dedicated }) => total + dedicated, 0) === 100
  )
}
