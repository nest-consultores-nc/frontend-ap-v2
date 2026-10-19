// Respuesta de GET /dashboards-api/monitoreo
// Solo usuarios activos (sin el usuario id 2), como el reporte de Power BI.

export interface IMonUser {
  id: number
  name: string
}

export interface IMonProject {
  id: number
  name: string
  clientId: number | null
  client: string | null
  active: boolean
}

/** Dedicación semanal: ded = fracción de la semana (1 = 100 %) */
export interface IMonDedication {
  id: number
  u: number
  p: number
  /** fecha guardada como semana, 'YYYY-MM-DD' (lunes en registros nuevos, domingo en antiguos) */
  w: string
  ded: number
  /** dedicación consolidada por el trabajador */
  cons: boolean
}

/** Dedicación mensual ajustada: prop = proporción del mes */
export interface IMonDedicationAj {
  u: number
  p: number
  /** primer día del mes, 'YYYY-MM-DD' */
  d: string
  prop: number
}

export interface IMonitoringDashboard {
  success: boolean
  generatedAt: string
  users: IMonUser[]
  projects: IMonProject[]
  dedications: IMonDedication[]
  dedicationsAj: IMonDedicationAj[]
}
