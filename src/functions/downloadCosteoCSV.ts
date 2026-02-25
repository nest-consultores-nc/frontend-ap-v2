import { ICosteoMensual } from '../interfaces/costeo/costeo-mensual.interface';
import { Datum } from '../interfaces/costeo/utilidad.interface';
import { IDataIngresos } from '../interfaces/costeo/ingresos.interface';

export const formatDateToISO = (date: Date | string): string => {
  if (typeof date === 'string' && date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const formatDateForCSV = (date: Date | string): string => {
  return formatDateToISO(date);
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
 * @param {ICosteoMensual[]} [costeoMensual] - Arreglo de objetos con datos de costeo mensual.
 * @param {Datum[]} [datumData] - Arreglo de objetos con datos de utilidad.
 * @param {IDataIngresos[]} [ingresosData] - Arreglo de objetos con datos de ingresos.
 * @param {string} selectedDate - La fecha seleccionada en formato "DD-MM-AAAA".
 *
 * @returns {void} - No devuelve ningún valor, pero crea un archivo CSV y lo descarga en el navegador del usuario.
 */
export const downloadCosteoCSV = async ({
  nameFile = 'archivo',
  costeoMensual,
  datumData,
  ingresosData,
  selectedDate,
}: Props): Promise<void> => {

  let ufValue: number | null = null;

  try {
    const response = await fetch('https://mindicador.cl/api/uf');
    const data = await response.json();
    ufValue = data.serie[0].valor; 
  } catch (error) {
    console.error('Error fetching UF:', error);
    return; 
  }

  if (!ufValue) {
    console.error('No se pudo obtener el valor de la UF.');
    return;
  }

  const csvRows: string[] = [];

  if (costeoMensual && costeoMensual.length > 0) {

    const headers = [
      'Fecha',
      'Cliente Proyecto',
      'Costo Sueldo',
      'Costo Directo',
      'Costo Indirecto',
      'Costo Proyecto',
    ];
    csvRows.push(headers.join(','));

    costeoMensual.forEach((row) => {
      const values = [
        formatDateForCSV(row.date),
        row.project_client,
        ((row.salarie_cost * ufValue) / 1_000_000).toFixed(2),
        ((row.direct_cost * ufValue) / 1_000_000).toFixed(2),
        ((row.indirect_cost * ufValue) / 1_000_000).toFixed(2),
        ((row.project_cost * ufValue) / 1_000_000).toFixed(2),
      ];
      csvRows.push(values.join(','));
    });
  } else if (datumData && datumData.length > 0) {

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
        formatDateForCSV(row.date), 
        row.project_client,
        ((row.amount * ufValue) / 1_000_000).toFixed(2),
        ((row.project_cost * ufValue) / 1_000_000).toFixed(2),
        ((row.utilidad * ufValue) / 1_000_000).toFixed(2),
      ];
      csvRows.push(values.join(','));
    });
  } else if (ingresosData && ingresosData.length > 0) {

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
        formatDateForCSV(row.date), 
        row.detail,
        row.temporalities_name,
        row.project_client,
        ((row.amount * ufValue) / 1_000_000).toFixed(2),
      ];
      csvRows.push(values.join(','));
    });
  } else {
    console.error('No se proporcionaron datos válidos para generar el CSV.');
    return;
  }

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${nameFile}_${selectedDate}.csv`);
  a.click();

  window.URL.revokeObjectURL(url);
};
