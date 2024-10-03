export interface IUtilidad {
  status: string
  message: string
  data: Datum[]
}

export interface Datum {
  date: string
  project_id: number
  amount: number
  project_cost: number
  _merge: Merge
  utilidad: number
}

export enum Merge {
  Both = 'both',
  LeftOnly = 'left_only',
  RightOnly = 'right_only',
}
