import { fetchFromApiCosteo } from '.'
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface'
import { IIngresos } from '../../interfaces/costeo/ingresos.interface'
import { IUtilidad } from '../../interfaces/costeo/utilidad.interface'

export const getGenerarCosteoMensual = async (searchDate: string) => {
  const [anio, mes] = searchDate.split('-')

  return await fetchFromApiCosteo<ICosteoMensual[]>(
    `costeo-mensual/?mes=${mes}&anio=${anio}`
  )
}
export const getGenerarUtilidad = async () => {
  const response = await fetchFromApiCosteo<IUtilidad>('utilidad')
  console.log("Response from API:", response);
  return response;
}
export const getGenerarIngresos = async (searchDate: string) => {
  const [anio, mes] = searchDate.split('-')

  return await fetchFromApiCosteo<IIngresos>(`income/?mes=${mes}&anio=${anio}`)
}
