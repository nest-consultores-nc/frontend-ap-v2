import { ICosteoMensual } from '../interfaces/costeo/costeo-mensual.interface';
import { Datum } from '../interfaces/costeo/utilidad.interface';
import { IDataIngresos } from '../interfaces/costeo/ingresos.interface';

// Función para formatear la fecha a "yyyy-MM-dd"
export const formatDateToISO = (date: Date | string): string => {
  // Si la fecha es un string en formato "dd/MM/yyyy"
  if (typeof date === 'string' && date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si la fecha es un objeto Date, conviértelo a "yyyy-MM-dd"
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Asegura dos dígitos para el mes
  const day = String(d.getDate()).padStart(2, '0'); // Asegura dos dígitos para el día

  return `${year}-${month}-${day}`; // Retorna solo la parte de la fecha
};

// Función para formatear la fecha para el CSV sin agregar apóstrofe
const formatDateForCSV = (date: Date | string): string => {
  return formatDateToISO(date); // Solo formatea la fecha a yyyy-MM-dd sin apóstrofe
};

interface Props {
  nameFile: string;
  costeoMensual?: ICosteoMensual[];
  datumData?: Datum[];
  ingresosData?: IDataIngresos[];
  selectedDate: string;
}

/**
 * Genera y descarga un archivo CSV con los datos proporcionados.
 * La función soporta tres tipos de entradas: costeoMensual, datumData e ingresosData.
 *
 * @param {string} nameFile - El nombre del archivo CSV a descargar (sin la extensión).
 * Se concatenará con `selectedDate` para generar el nombre final.
 * @param {ICosteoMensual[]} [costeoMensual] - Arreglo de objetos con datos de costeo mensual.
 * @param {Datum[]} [datumData] - Arreglo de objetos con datos de utilidad.
 * @param {IDataIngresos[]} [ingresosData] - Arreglo de objetos con datos de ingresos.
 * @param {string} selectedDate - La fecha seleccionada en formato "DD-MM-AAAA", que se utilizará en el nombre del archivo descargado.
 *
 * @returns {void} - No devuelve ningún valor, pero crea un archivo CSV y lo descarga en el navegador del usuario.
 */
export const downloadCosteoCSV = ({
  nameFile = 'archivo',
  costeoMensual,
  datumData,
  ingresosData,
  selectedDate,
}: Props): void => {
  const csvRows: string[] = [];

  if (costeoMensual && costeoMensual.length > 0) {
    // Cabeceras para costeoMensual
    const headers = [
      'Fecha',
      'Cliente Proyecto',
      'Costo Salario (MM$)',
      'Costo Directo (MM$)',
      'Costo Indirecto (MM$)',
      'Costo Proyecto (MM$)',
    ];
    csvRows.push(headers.join(','));

    costeoMensual.forEach((row) => {
      const values = [
        formatDateForCSV(row.date),
        row.project_client,
        (row.salarie_cost/ 100).toFixed(2),
        (row.direct_cost/ 100).toFixed(2),
        (row.indirect_cost/ 100).toFixed(2),
        (row.project_cost/ 100).toFixed(2),
      ];
      csvRows.push(values.join(','));
    });
  } else if (datumData && datumData.length > 0) {
    // Cabeceras para datumData (utilidad)
    const headers = [
      'Fecha',
      'Cliente Proyecto',
      'Ingresos (MM$)',
      'Costo Proyecto (MM$)',
      'Utilidad (MM$)',
    ];
    csvRows.push(headers.join(','));

    datumData.forEach((row) => {
      const values = [
        formatDateForCSV(row.date), // Formatea la fecha sin apóstrofe
        row.project_client, // Cliente y Proyecto (con UTF-8)
        (row.amount/ 100).toFixed(2), // Formateo de ingresos a dos decimales
        (row.project_cost/ 100).toFixed(2), // Formateo del costo del proyecto a dos decimales
        (row.utilidad/ 100).toFixed(2), // Formateo de utilidad a dos decimales
      ];
      csvRows.push(values.join(','));
    });
  } else if (ingresosData && ingresosData.length > 0) {
    // Cabeceras para ingresosData
    const headers = [
      'Fecha',
      'Detalle',
      'Temporalidades',
      'Cliente Proyecto',
      'Ingresos (MM$)',
    ];
    csvRows.push(headers.join(','));

    ingresosData.forEach((row) => {
      const values = [
        formatDateForCSV(row.date), // Formatea la fecha sin apóstrofe
        row.detail,
        row.temporalities_name,
        row.project_client,
        (row.amount_p / 1_000_000).toFixed(2), // Ajuste de la cantidad a millones
      ];
      csvRows.push(values.join(','));
    });
  } else {
    console.error('No se proporcionaron datos válidos para generar el CSV.');
    return;
  }

  // Agregar BOM para UTF-8 al inicio del CSV
  const csvString = '\uFEFF' + csvRows.join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${nameFile}_${selectedDate}.csv`);
  a.click();

  window.URL.revokeObjectURL(url);
};
