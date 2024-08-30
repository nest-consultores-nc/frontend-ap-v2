export interface IRoles {
  success: boolean
  roles: IRole[]
  workday: IWorkday[]
}

export interface IRole {
  id: number
  name: string
  slug: string
  description: null | string
}

export interface IWorkday {
  id: number
  workday: string
  slug: string
  hours: number
}
