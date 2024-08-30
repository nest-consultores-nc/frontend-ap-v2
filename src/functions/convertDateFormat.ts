/**
 * Convierte una fecha del formato "DD-MM-AAAA" al formato "AAAA-MM-DD".
 * @param {string} dateString - La fecha en formato "DD-MM-AAAA" a convertir.
 * @returns {string} La fecha convertida en formato "AAAA-MM-DD".
 */
export const convertDateFormat = (dateString: string) => {
  const [day, month, year] = dateString.split('-')
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}
