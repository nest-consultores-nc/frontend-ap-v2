// Lógica del dashboard de monitoreo (reemplaza "01. Monitoreo_Polaris" de Power BI).
//
// Semanas: igual que la tabla Calendario del reporte, la semana de un registro es
// el lunes calculado como  fecha - WEEKDAY(fecha) + 2  (WEEKDAY: domingo = 1).
// Así los registros nuevos (guardados en lunes) y los antiguos (guardados en
// domingo) caen en la semana laboral correcta.
//
// Meses: como en el reporte, el mes de un registro semanal es el de su fecha guardada.

import {
  IMonitoringDashboard,
  IMonProject,
} from '../../../interfaces/dashboards/monitoring.interface'

/**
 * Tolerancia para "100 %": las dedicaciones se guardan con 2 decimales, así que las
 * sumas son múltiplos de 1 %. 0,5 % solo absorbe errores de redondeo (33 + 33 + 34)
 * y nunca convierte un 99 % en completo.
 */
export const TOL = 0.005
/** Umbral del estado mensual en Power BI (dedications_aj): 98 % */
export const UMBRAL_MENSUAL = 0.98

export type Estado = 'completo' | 'incompleto' | 'sin'

export const ESTADO = {
  completo: { label: 'Completo', icon: '✓', color: '#1D9E75', fondo: '#E1F5EE' },
  incompleto: { label: 'Incompleto', icon: '!', color: '#EF9F27', fondo: '#FAEEDA' },
  sin: { label: 'Sin registro', icon: '–', color: '#E24B4A', fondo: '#FCEBEB' },
} as const

export const estadoSemanal = (total: number, hasRows: boolean): Estado =>
  !hasRows || total <= TOL ? 'sin' : total >= 1 - TOL ? 'completo' : 'incompleto'

export const estadoMensual = (prop: number): Estado =>
  prop <= TOL ? 'sin' : prop >= UMBRAL_MENSUAL ? 'completo' : 'incompleto'

/** Color del % de cumplimiento del equipo (mismas reglas que Power BI) */
export const colorCumplimiento = (p: number) =>
  p >= 1 - 1e-9 ? ESTADO.completo.color : p >= 0.7 ? ESTADO.incompleto.color : ESTADO.sin.color

// ---------- fechas ----------

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
const parseISO = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00Z`)
const addDays = (s: string, n: number) => {
  const d = parseISO(s)
  d.setUTCDate(d.getUTCDate() + n)
  return toISO(d)
}

/** Lunes de la semana según la fórmula del Calendario de Power BI */
export const weekStart = (iso: string) => {
  const dow = parseISO(iso).getUTCDay() // domingo = 0
  return addDays(iso, 1 - dow)
}

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** '2026-07-27' → 'Semana del 27 - 31 jul 2026' (lunes a viernes, como en Power BI) */
export const weekLabel = (monday: string) => {
  const fin = parseISO(addDays(monday, 4))
  return `Semana del ${parseISO(monday).getUTCDate()} - ${fin.getUTCDate()} ${MESES_CORTOS[fin.getUTCMonth()]} ${fin.getUTCFullYear()}`
}

/** '2026-07' → 'julio - 2026' */
export const monthLabel = (ym: string) => `${MESES[Number(ym.slice(5, 7)) - 1]} - ${ym.slice(0, 4)}`

/** Las 10 semanas más recientes hasta la actual (el reporte muestra el mismo rango) */
export const recentWeeks = (count = 10) => {
  const current = weekStart(todayISO())
  return Array.from({ length: count }, (_, i) => addDays(current, -7 * i))
}

/** Meses desde el primer registro hasta hoy, del más reciente al más antiguo */
export const monthRange = (firstISO: string | null) => {
  const end = todayISO().slice(0, 7)
  const start = firstISO ? firstISO.slice(0, 7) : end
  const out: string[] = []
  let [y, m] = end.split('-').map(Number)
  while (`${y}-${pad(m)}` >= start) {
    out.push(`${y}-${pad(m)}`)
    if (m === 1) {
      m = 12
      y--
    } else {
      m--
    }
  }
  return out
}

// ---------- modelo ----------

export interface DedRow {
  id: number
  user: number
  project: number
  client: number | null
  /** lunes de la semana */
  week: string
  /** fecha guardada (Power BI agrupa los meses por esta fecha) */
  date: string
  month: string
  ded: number
  cons: boolean
}

export interface AjRow {
  user: number
  project: number
  client: number | null
  month: string
  prop: number
}

export interface MonModel {
  users: { id: number; name: string }[]
  userNames: Map<number, string>
  projects: Map<number, IMonProject>
  clientNames: Map<number, string>
  /** clientes con proyectos activos (opciones del filtro, como en Power BI) */
  activeClients: number[]
  dedications: DedRow[]
  /** dedicación mensual (dedications_aj, más la estimada para meses sin datos) */
  aj: AjRow[]
  /** meses cuya proporción mensual se estimó desde las dedicaciones semanales */
  ajEstimated: Set<string>
  months: string[]
}

export const buildModel = (data: IMonitoringDashboard): MonModel => {
  const projects = new Map(data.projects.map((p) => [p.id, p]))
  const clientNames = new Map<number, string>()
  const activeClients = new Set<number>()
  data.projects.forEach((p) => {
    if (p.clientId === null || !p.client) return
    clientNames.set(p.clientId, p.client)
    if (p.active) activeClients.add(p.clientId)
  })
  const users = [...data.users].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  const clientOf = (p: number) => projects.get(p)?.clientId ?? null

  const dedications = data.dedications.map((r) => ({
    id: r.id,
    user: r.u,
    project: r.p,
    client: clientOf(r.p),
    week: weekStart(r.w),
    date: r.w,
    month: r.w.slice(0, 7),
    ded: r.ded,
    cons: r.cons,
  }))
  const firstDate = dedications.reduce<string | null>((min, r) => (!min || r.date < min ? r.date : min), null)

  const aj: AjRow[] = data.dedicationsAj.map((r) => ({
    user: r.u,
    project: r.p,
    client: clientOf(r.p),
    month: r.d.slice(0, 7),
    prop: r.prop,
  }))

  // dedications_aj la llena un proceso de la base (trigger), no el backend. Si un mes
  // aún no tiene filas (p. ej. el mes en curso), se estima desde las dedicaciones
  // semanales: proporción = suma de dedicación del mes / semanas registradas del mes.
  const mesesConAj = new Set(aj.map((r) => r.month))
  const ajEstimated = new Set<string>()
  const semanasPorMes = new Map<string, Set<string>>()
  dedications.forEach((r) => {
    if (mesesConAj.has(r.month)) return
    if (!semanasPorMes.has(r.month)) semanasPorMes.set(r.month, new Set())
    semanasPorMes.get(r.month)!.add(r.date)
  })
  const estimado = new Map<string, AjRow>()
  dedications.forEach((r) => {
    const semanas = semanasPorMes.get(r.month)
    if (!semanas) return
    ajEstimated.add(r.month)
    const key = `${r.user}|${r.project}|${r.month}`
    const prev = estimado.get(key)
    const prop = r.ded / semanas.size
    if (prev) prev.prop += prop
    else estimado.set(key, { user: r.user, project: r.project, client: r.client, month: r.month, prop })
  })

  return {
    users,
    userNames: new Map(users.map((u) => [u.id, u.name])),
    projects,
    clientNames,
    activeClients: [...activeClients].sort((a, b) =>
      (clientNames.get(a) ?? '').localeCompare(clientNames.get(b) ?? '', 'es')
    ),
    dedications,
    aj: [...aj, ...estimado.values()],
    ajEstimated,
    months: monthRange(firstDate),
  }
}

/** "Cliente · Proyecto", como la columna calculada del reporte */
export const projectLabel = (m: MonModel, id: number) => {
  const p = m.projects.get(id)
  return p ? `${p.client ?? 'Sin cliente'} · ${p.name}` : `Proyecto ${id}`
}

export const clientLabel = (m: MonModel, id: number | null) =>
  id === null ? 'Sin cliente' : m.clientNames.get(id) ?? `Cliente ${id}`

// ---------- filtros ----------

export interface MonFilters {
  user: number[]
  client: number[]
  project: number[]
}

export const EMPTY_MON_FILTERS: MonFilters = { user: [], client: [], project: [] }

type Dim = keyof MonFilters

/** Aplica filtros a filas con user/client/project; `skip` deja fuera dimensiones */
export const filterRows = <T extends { user: number; client: number | null; project: number }>(
  rows: T[],
  f: MonFilters,
  skip: Dim[] = []
) => {
  const sets = (Object.keys(f) as Dim[])
    .filter((d) => !skip.includes(d) && f[d].length > 0)
    .map((d) => [d, new Set(f[d])] as const)
  if (sets.length === 0) return rows
  return rows.filter((r) => sets.every(([d, s]) => r[d] !== null && s.has(r[d] as number)))
}

export const sumBy = <T>(rows: T[], key: (r: T) => number | string | null, val: (r: T) => number) => {
  const out = new Map<number | string, number>()
  for (const r of rows) {
    const k = key(r)
    if (k === null) continue
    out.set(k, (out.get(k) ?? 0) + val(r))
  }
  return out
}

// ---------- medidas ----------

export interface TeamSummary {
  activos: number
  completos: number
  incompletos: number
  sinRegistro: number
  cumplimiento: number
}

/**
 * Tarjetas semanales. Cuentan a todo el equipo activo (ignoran el filtro de
 * trabajador, como ALL(users) en Power BI) y sí respetan el filtro de cliente.
 * Los tres grupos suman siempre el total de activos.
 */
export const weeklySummary = (m: MonModel, rows: DedRow[]): TeamSummary => {
  const totals = sumBy(rows, (r) => r.user, (r) => r.ded)
  let completos = 0
  let incompletos = 0
  for (const u of m.users) {
    const e = estadoSemanal(totals.get(u.id) ?? 0, totals.has(u.id))
    if (e === 'completo') completos++
    else if (e === 'incompleto') incompletos++
  }
  const activos = m.users.length
  return {
    activos,
    completos,
    incompletos,
    sinRegistro: activos - completos - incompletos,
    cumplimiento: activos ? completos / activos : 0,
  }
}

/**
 * Tarjetas del período (medidas "Completos/Incompletos/Sin Registro Período"):
 * completo = completó el 100 % en todas las semanas con registros del período.
 */
export const periodSummary = (m: MonModel, rows: DedRow[]): TeamSummary => {
  const weeks = new Set(rows.map((r) => r.date))
  const byUserWeek = sumBy(rows, (r) => `${r.user}|${r.date}`, (r) => r.ded)
  const withRows = new Set(rows.map((r) => r.user))
  let completos = 0
  let incompletos = 0
  for (const u of m.users) {
    if (!withRows.has(u.id)) continue
    let full = 0
    weeks.forEach((w) => {
      if ((byUserWeek.get(`${u.id}|${w}`) ?? 0) >= 1 - TOL) full++
    })
    if (weeks.size > 0 && full === weeks.size) completos++
    else incompletos++
  }
  const activos = m.users.length
  return {
    activos,
    completos,
    incompletos,
    sinRegistro: activos - completos - incompletos,
    cumplimiento: activos ? completos / activos : 0,
  }
}
