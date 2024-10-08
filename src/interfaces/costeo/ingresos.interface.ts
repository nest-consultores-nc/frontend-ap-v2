export interface IIngresos {
  status: string
  message: string
  data: IDataIngresos[]
}

export interface IDataIngresos {
  project_id: number
  amount: number
  date: Date
  detail: string
  UF: number
  temporalities_name: string
  project_client: string
  amount_p: number
}
