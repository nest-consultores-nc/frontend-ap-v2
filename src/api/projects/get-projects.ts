import { fetchFromApi } from '.'
import { ICategory } from '../../interfaces/projects/project-category.interface'
import { IType } from '../../interfaces/projects/project-type.interface'
import { IProject } from '../../interfaces/projects/projects.interface'

export const getProjectsAndActivities = (token: string) =>
  fetchFromApi<{ projects: IProject[] }>(
    'proyectos-api/proyectos-y-actividades',
    token
  )

export const getAllProjects = (token: string, showAll: boolean) =>
  fetchFromApi<{ projects: IProject[] }>(
    `proyectos-api/proyectos/${showAll}`,
    token
  )

export const getCategoriesProjectsQuery = (token: string) =>
  fetchFromApi<{ categories: ICategory[] }>(
    'categories-api/all-projects-categories',
    token
  )

export const getTypesProjectsQuery = (token: string) =>
  fetchFromApi<{ types: IType[] }>('/types-api/all-projects-types', token)
