export interface IProjectTypes {
  success: boolean
  types: IType[]
}

export interface IType {
  id: number
  type_name: string
  type_slug: string
  type_description: string
}
