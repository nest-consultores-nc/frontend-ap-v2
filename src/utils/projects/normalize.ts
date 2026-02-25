import type { IProject } from '../../interfaces/projects/projects.interface'

type AnyRow = Record<string, any>


export function normalizeProjectRow(r: AnyRow): IProject {
  const id = Number(r?.id ?? r?.project_id ?? NaN)

 
  const project_name = String(r?.project_name ?? r?.name ?? '').trim()
  const clientName = r?.client?.clientName ?? r?.client_name ?? null
  const client = clientName ? { clientName } : undefined

  const project_type_id     = r?.project_type_id ?? r?.type_id ?? null
  const project_category_id = r?.project_category_id ?? null
  const project_client_id   = r?.project_client_id ?? r?.client_id ?? null
  const project_or_activity = r?.project_or_activity ?? r?.type ?? null
  const active              = r?.active ?? r?.is_active ?? r?.status ?? null

  return {
   
    id,
    project_name,
    client,             
    client_name: clientName ?? undefined,
    project_type_id,
    project_category_id,
    project_client_id,
    project_or_activity,
    active,
  } as IProject
}

export function normalizeProjects(rows: AnyRow[]): IProject[] {
  return (rows ?? []).map(normalizeProjectRow).filter(p => Number.isFinite(p.id))
}
