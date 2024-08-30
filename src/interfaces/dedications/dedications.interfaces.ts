export interface IDedicationsByMonth {
  user: string
  dedications: IDedications[]
}

export interface IDedications {
  id: number
  project_name: string
  client_name: string
  week: Date
  dedicated: number
}

export interface IHistoryDedicationsByUserId {
  success: boolean
  dedications: ITableDedications[]
}

export interface ITableDedications {
  fecha: string
  dedications: IDedicationsByUserId[]
}

export interface IDedicationsByUserId {
  id: number
  user_id: number
  user_name: string
  project_id: number
  project_name: string
  client_name: string
  week: string
  end_of_week: Date
  dedicated: number
  consolidation: boolean
  createdAt: Date
  updatedAt: Date
}
