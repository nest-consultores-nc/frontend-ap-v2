export interface IDashboardResponse {
  success: boolean
  dashboard: IDashboard
}

export interface IDashboard {
  id: number
  name: string
  url: string
}
