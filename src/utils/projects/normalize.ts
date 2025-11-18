// DESPUÉS (NUEVO)
import type { IProject } from '../../interfaces/projects/projects.interface'

type AnyRow = Record<string, any>

/**
 * Lleva cualquier fila de backend (con client_name, client.clientName, name, etc.)
 * a una forma canónica compatible con el resto de tu UI.
 */
export function normalizeProjectRow(r: AnyRow): IProject {
  const id = Number(r?.id ?? r?.project_id ?? NaN)

  // nombre de proyecto
  const project_name = String(r?.project_name ?? r?.name ?? '').trim()

  // cliente (anidado y/o plano)
  const clientName = r?.client?.clientName ?? r?.client_name ?? null
  const client = clientName ? { clientName } : undefined

  // campos que usa tu bucketizado/filters
  const project_type_id     = r?.project_type_id ?? r?.type_id ?? null
  const project_category_id = r?.project_category_id ?? null
  const project_client_id   = r?.project_client_id ?? r?.client_id ?? null
  const project_or_activity = r?.project_or_activity ?? r?.type ?? null
  const active              = r?.active ?? r?.is_active ?? r?.status ?? null

  return {
    // mínimos que usas en toda la app
    id,
    project_name,
    client,               // <- preferido por projectBuckets.getProjectLabel
    // por compatibilidad con pantallas que usan client_name directo

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
