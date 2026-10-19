// Respuesta de GET /dashboards-api/financiero
// Montos en pesos chilenos (utilidad y costos ya convertidos con la UF del día).

export interface IFinProject {
  id: number
  name: string
  clientId: number | null
  client: string | null
  typeId: number | null
  type: string | null
  categoryId: number | null
  category: string | null
}

export interface IFinClient {
  id: number
  name: string
  createdAt: string | null
}

/** Fila de la tabla utilidad: ingreso, costo y utilidad del proyecto en el mes */
export interface IFinUtilidadRow {
  p: number | null
  d: string | null
  ing: number
  cost: number
  util: number
}

export interface IFinIncomeRow {
  p: number | null
  d: string | null
  amt: number
}

/** Fila de projects_costs: costo directo, indirecto, salarial y total */
export interface IFinCostRow {
  p: number | null
  d: string | null
  dir: number
  ind: number
  sal: number
  tot: number
}

export interface IFinancialDashboard {
  success: boolean
  generatedAt: string
  uf: { value: number; date: string | null }
  calendar: { start: string | null; end: string | null }
  projects: IFinProject[]
  clients: IFinClient[]
  utilidad: IFinUtilidadRow[]
  income: IFinIncomeRow[]
  costs: IFinCostRow[]
}
