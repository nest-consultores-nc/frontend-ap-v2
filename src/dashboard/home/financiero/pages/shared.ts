import { Dim, Filters, Model } from '../model'
import { PBI } from '../theme'

export interface PageProps {
  model: Model
  filters: Filters
  /** Selecciona (o des-selecciona) un valor desde un clic en un gráfico */
  select: (dim: Dim, key: string | number, multi: boolean) => void
}

export const CHART_H = 280

/** Valores seleccionados de una dimensión como strings (para comparar con las claves de los gráficos) */
export const selectedSet = (filters: Filters, dim: Dim) => new Set(filters[dim].map(String))

/** Color del tipo de proyecto en "Utilidades por tipo": el de Power BI si lo tiene fijo */
export const typeColorUtilidad = (model: Model, typeId: number) => {
  const name = model.typeNames.get(typeId) ?? ''
  if (PBI.tiposUtilidad[name]) return PBI.tiposUtilidad[name]
  const sinColor = model.typeOrder.filter((id) => !PBI.tiposUtilidad[model.typeNames.get(id) ?? ''])
  return PBI.tiposUtilidadResto[Math.max(0, sinColor.indexOf(typeId)) % PBI.tiposUtilidadResto.length]
}

/** Color del tipo de proyecto en "Ingreso por tipo": la familia de verdes de Power BI */
export const typeColorIngreso = (model: Model, typeId: number) =>
  PBI.tiposIngreso[Math.max(0, model.typeOrder.indexOf(typeId)) % PBI.tiposIngreso.length]

export const COST_CLASSES = [
  { field: 'dir', name: 'Costo directo', color: PBI.directo },
  { field: 'ind', name: 'Costo indirecto', color: PBI.indirecto },
  { field: 'sal', name: 'Costo salarial', color: PBI.salarial },
] as const
