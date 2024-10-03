import { ICosteoMensual } from '../interfaces/costeo/costeo-mensual.interface'
import { Datum } from '../interfaces/costeo/utilidad.interface'
import { IDataIngresos } from '../interfaces/costeo/ingresos.interface'
import { formatDateToISO } from './formatDateTime'

interface Props {
  nameFile: string
  costeoMensual?: ICosteoMensual[]
  datumData?: Datum[]
  ingresosData?: IDataIngresos[]
  selectedDate: string
}

/**
 * Genera y descarga un archivo CSV con los datos proporcionados.
 * La función soporta tres tipos de entradas: costeoMensual, datumData e ingresosData.
 *
 * @param {string} nameFile - El nombre del archivo CSV a descargar (sin la extensión).
 * Se concatenará con `selectedDate` para generar el nombre final.
 * @param {ICosteoMensual[]} [costeoMensual] - Arreglo de objetos con datos de costeo mensual, como costos de salario, costos directos, costos indirectos, etc.
 * @param {Datum[]} [datumData] - Arreglo de objetos con datos de utilidad, que incluyen campos como `amount`, `project_cost`, `utilidad`, etc.
 * @param {IngresosData[]} [ingresosData] - Arreglo de objetos con datos de ingresos, que incluyen campos como `amount`, `detail`, `UF`, `temporalities_id`, etc.
 * @param {string} selectedDate - La fecha seleccionada en formato "DD-MM-AAAA", que se utilizará en el nombre del archivo descargado.
 *
 * @returns {void} - No devuelve ningún valor, pero crea un archivo CSV y lo descarga en el navegador del usuario.
 *
 * @description
 * Esta función toma un conjunto de datos (costeoMensual, datumData o ingresosData) y los convierte en formato CSV. Dependiendo del tipo de datos proporcionado, genera las cabeceras y las filas correspondientes.
 * Si no se proporcionan datos válidos, la función no generará el archivo CSV y mostrará un error en la consola.
 *
 * - Primero, la función valida qué tipo de datos se ha proporcionado: `costeoMensual`, `datumData` o `ingresosData`.
 * - A continuación, genera las cabeceras específicas para el tipo de datos.
 * - Luego, recorre el arreglo de datos y genera las filas correspondientes.
 * - Usa un Blob para crear el archivo CSV y genera un enlace temporal que dispara la descarga del archivo en el navegador del usuario.
 * - Finalmente, revoca el objeto URL creado para liberar memoria.
 * @example
 * const ingresosData = [
 *   {
 *     project_id: 2,
 *     amount: 5000,
 *     date: new Date('2024-10-01'),
 *     detail: 'Venta de producto',
 *     UF: 50,
 *     temporalities_id: 1,
 *     project_client: 'Cliente B',
 *     amount_p: 4500,
 *   }
 * ];
 *
 * const selectedDate = '01-10-2024';
 *
 * downloadCosteoCSV({
 *   nameFile: 'ingresos',
 *   ingresosData,
 *   selectedDate,
 * });
 *
 */
export const downloadCosteoCSV = ({
  nameFile = 'archivo',
  costeoMensual,
  datumData,
  ingresosData,
  selectedDate,
}: Props): void => {
  const csvRows: string[] = []

  if (costeoMensual && costeoMensual.length > 0) {
    // Cabeceras para costeoMensual
    const headers = [
      'project_id',
      'salarie_cost',
      'direct_cost',
      'date',
      'indirect_cost',
      'project_cost',
      'project_client',
    ]
    csvRows.push(headers.join(','))

    costeoMensual.forEach((row) => {
      const values = [
        row.project_id,
        row.salarie_cost,
        row.direct_cost,
        row.date,
        row.indirect_cost,
        row.project_cost,
        row.project_client,
      ]
      csvRows.push(values.join(','))
    })
  } else if (datumData && datumData.length > 0) {
    // Cabeceras para datumData (utilidad)
    const headers = [
      'project_id',
      'amount',
      'date',
      'project_cost',
      '_merge',
      'utilidad',
    ]
    csvRows.push(headers.join(','))

    datumData.forEach((row) => {
      const values = [
        row.project_id,
        row.amount,
        row.date,
        row.project_cost,
        row.utilidad,
      ]
      csvRows.push(values.join(','))
    })
  } else if (ingresosData && ingresosData.length > 0) {
    // Cabeceras para ingresosData
    const headers = [
      'project_id',
      'amount',
      'date',
      'detail',
      'UF',
      'temporalities_id',
      'project_client',
      'amount_p',
    ]
    csvRows.push(headers.join(','))

    ingresosData.forEach((row) => {
      const values = [
        row.project_id,
        row.amount,
        formatDateToISO(row.date),
        row.detail,
        row.UF,
        row.temporalities_id,
        row.project_client,
        row.amount_p,
      ]
      csvRows.push(values.join(','))
    })
  } else {
    console.error('No se proporcionaron datos válidos para generar el CSV.')
    return
  }

  const csvString = csvRows.join('\n')

  const blob = new Blob([csvString], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.setAttribute('download', `${nameFile}_${selectedDate}.csv`)
  a.click()

  window.URL.revokeObjectURL(url)
}
