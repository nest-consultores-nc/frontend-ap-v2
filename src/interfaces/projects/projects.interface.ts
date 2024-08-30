export interface IProjects {
  success: boolean
  msg: string
  projects: IProject[]
}

export interface IProject {
  id: number
  project_name: string
  project_slug: string
  description: null | string
  project_status: string
  project_or_activity: IProjectOrActivity
  active: boolean
  project_category_id: number
  project_client_id: number
  project_type_id: number
  createdAt: Date
  client: IClient
  type: IType
  category: ICategory
  created_at?: Date
  updated_at?: Date
  client_name?: string
}

interface ICategory {
  categoryName: string
}

interface IClient {
  clientName: string
}
interface IProjectOrActivity {
  project_or_activity: string
}

interface IType {
  typeName: string
}
