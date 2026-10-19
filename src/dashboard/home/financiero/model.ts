// Lógica de filtros y agregaciones del dashboard financiero.
// Replica el modelo de Power BI: utilidad, income y projects_costs se unen a
// projects (→ clients / types) por project_id y a Calendario por su fecha.

import {
  IFinancialDashboard,
  IFinProject,
} from '../../../interfaces/dashboards/financial.interface'

/** Dimensiones por las que se puede filtrar (segmentadores o clic en un gráfico) */
export type Dim = 'year' | 'month' | 'period' | 'project' | 'type' | 'client'
export type Filters = Record<Dim, (string | number)[]>

export const EMPTY_FILTERS: Filters = {
  year: [],
  month: [],
  period: [],
  project: [],
  type: [],
  client: [],
}

export const hasFilters = (f: Filters) => Object.values(f).some((v) => v.length > 0)

/** Fila de un hecho con sus dimensiones ya resueltas */
export interface Fact {
  project: number | null
  type: number | null
  client: number | null
  date: string | null
  year: number | null
  month: number | null
  period: string | null
  inCalendar: boolean
}

export type UtilFact = Fact & { ing: number; cost: number; util: number }
export type IncomeFact = Fact & { amt: number }
export type CostFact = Fact & { dir: number; ind: number; sal: number; tot: number }

export interface Model {
  projects: Map<number, IFinProject>
  clientNames: Map<number, string>
  typeNames: Map<number, string>
  /** color fijo por tipo de proyecto (sigue a la entidad, no a su ranking) */
  typeOrder: number[]
  utilidad: UtilFact[]
  income: IncomeFact[]
  costs: CostFact[]
  clients: { id: number; name: string; period: string | null }[]
  years: number[]
  calendar: { start: string | null; end: string | null }
}

export const buildModel = (data: IFinancialDashboard): Model => {
  const projects = new Map(data.projects.map((p) => [p.id, p]))
  const clientNames = new Map(data.clients.map((c) => [c.id, c.name]))
  const typeNames = new Map<number, string>()
  data.projects.forEach((p) => {
    if (p.typeId !== null && p.type) typeNames.set(p.typeId, p.type)
  })

  const { start, end } = data.calendar
  const fact = (p: number | null, d: string | null): Fact => {
    const proj = p !== null ? projects.get(p) : undefined
    const date = d ? d.slice(0, 10) : null
    return {
      project: proj ? proj.id : null,
      type: proj?.typeId ?? null,
      client: proj?.clientId ?? null,
      date,
      year: date ? Number(date.slice(0, 4)) : null,
      month: date ? Number(date.slice(5, 7)) : null,
      period: date ? date.slice(0, 7) : null,
      inCalendar: !!date && (!start || date >= start) && (!end || date <= end),
    }
  }

  const years: number[] = []
  if (start && end) {
    for (let y = Number(start.slice(0, 4)); y <= Number(end.slice(0, 4)); y++) years.push(y)
  }

  return {
    projects,
    clientNames,
    typeNames,
    typeOrder: [...typeNames.keys()].sort((a, b) => a - b),
    utilidad: data.utilidad.map((r) => ({ ...fact(r.p, r.d), ing: r.ing, cost: r.cost, util: r.util })),
    income: data.income.map((r) => ({ ...fact(r.p, r.d), amt: r.amt })),
    costs: data.costs.map((r) => ({
      ...fact(r.p, r.d), dir: r.dir, ind: r.ind, sal: r.sal, tot: r.tot,
    })),
    clients: data.clients.map((c) => ({
      id: c.id,
      name: c.name,
      period: c.createdAt ? c.createdAt.slice(0, 7) : null,
    })),
    years,
    calendar: data.calendar,
  }
}

const DATE_DIMS: Dim[] = ['year', 'month', 'period']
const ALL_DIMS: Dim[] = ['year', 'month', 'period', 'project', 'type', 'client']

/**
 * Aplica los filtros a un hecho. `except` deja fuera la dimensión del propio
 * gráfico, como en Power BI: el gráfico donde haces clic sigue mostrando todas
 * sus barras (con la seleccionada resaltada) y el resto se filtra.
 */
export const applyFilters = <T extends Fact>(rows: T[], f: Filters, except?: Dim): T[] => {
  const active = ALL_DIMS.filter((d) => d !== except && f[d].length > 0)
  if (active.length === 0) return rows
  const sets = active.map((d) => [d, new Set(f[d])] as const)
  const dateFiltered = active.some((d) => DATE_DIMS.includes(d))
  return rows.filter((r) => {
    // Filas fuera de la tabla Calendario no pasan ningún filtro de fecha
    if (dateFiltered && !r.inCalendar) return false
    return sets.every(([d, s]) => r[d] !== null && s.has(r[d] as string | number))
  })
}

/** Para ejes de tiempo: solo fechas dentro del Calendario, como en Power BI */
export const onCalendar = <T extends Fact>(rows: T[]) => rows.filter((r) => r.inCalendar)

/** Suma por clave, devolviendo un Map ordenado por inserción */
export const groupSum = <T, K>(
  rows: T[],
  key: (r: T) => K | null,
  fields: (keyof T)[]
): Map<K, Record<string, number>> => {
  const out = new Map<K, Record<string, number>>()
  for (const r of rows) {
    const k = key(r)
    if (k === null) continue
    let acc = out.get(k)
    if (!acc) {
      acc = Object.fromEntries(fields.map((f) => [f as string, 0]))
      out.set(k, acc)
    }
    for (const f of fields) acc[f as string] += Number(r[f]) || 0
  }
  return out
}

/** Todos los meses entre el primer y el último periodo, para que el eje no salte meses */
export const periodRange = (periods: string[]): string[] => {
  if (periods.length === 0) return []
  const sorted = [...periods].sort()
  const [y0, m0] = sorted[0].split('-').map(Number)
  const [y1, m1] = sorted[sorted.length - 1].split('-').map(Number)
  const out: string[] = []
  for (let y = y0, m = m0; y < y1 || (y === y1 && m <= m1); m === 12 ? (y++, (m = 1)) : m++) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return out
}

export const sumOf = <T>(rows: T[], f: keyof T) => rows.reduce((s, r) => s + (Number(r[f]) || 0), 0)

/** DIVIDE de DAX: devuelve null si el denominador es 0 */
export const divide = (a: number, b: number) => (b === 0 ? null : a / b)

/** Medidas del reporte original */
export const ratios = (rows: UtilFact[]) => {
  const ing = sumOf(rows, 'ing')
  const cost = sumOf(rows, 'cost')
  const util = sumOf(rows, 'util')
  return {
    ing,
    cost,
    util,
    margen: divide(util, ing), // Margen_Utilidad = Utilidad / Ingreso
    productividad: divide(util, cost), // Productividad = Utilidad / Costo
    eficiencia: divide(cost, ing), // Eficiencia = Costo / Ingreso
  }
}

export const projectName = (m: Model, id: number) => m.projects.get(id)?.name ?? `Proyecto ${id}`
export const clientName = (m: Model, id: number) => m.clientNames.get(id) ?? `Cliente ${id}`
export const typeName = (m: Model, id: number) => m.typeNames.get(id) ?? `Tipo ${id}`
