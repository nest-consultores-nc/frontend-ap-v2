export interface IUsers {
  id: number
  name: string
  detail?: string
  salarie?: number | null
  created_at: string
  updated_at: string
  user_id?: number | null
  date?: string | null
}

export interface IUserCSV {
  user_id: number
  salarie: string | null
  detail: string
  date: string | null
}
