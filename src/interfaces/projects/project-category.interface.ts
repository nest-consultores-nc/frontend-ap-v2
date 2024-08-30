export interface IProjectCategory {
  success: boolean
  categories: ICategory[]
}

export interface ICategory {
  id: number
  category_name: string
  category_description: string
  category_slug: string
}
