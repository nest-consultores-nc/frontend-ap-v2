// src/utils/outlays/projectBuckets.ts
import { IProject } from '../../interfaces/projects/projects.interface'

export const TYPE = {
  POLUX: 1,
  RECURRENT: 2,
  NON_RECURRENT: 3,
  ACTIVITIES: 4,
} as const

export type ProjectWithType = IProject & {
  project_type_id?: number | null
  type_id?: number | null
  project_category_id?: number | null
  project_client_id?: number | null
  project_or_activity?: string | null
  active?: boolean | string | number | null
}

const getTypeId = (p: ProjectWithType): number =>
  Number(p.project_type_id ?? p.type_id ?? NaN)

export const isPolux = (p: ProjectWithType) => getTypeId(p) === TYPE.POLUX
export const isRecurrent = (p: ProjectWithType) => getTypeId(p) === TYPE.RECURRENT
export const isNonRecurrent = (p: ProjectWithType) => getTypeId(p) === TYPE.NON_RECURRENT

export const isActivity = (p: ProjectWithType) => {
  const tag = (p.project_or_activity ?? '').toString().trim().toLowerCase()
  const typeId   = Number(p.project_type_id ?? p.type_id ?? NaN)
  const catId    = Number(p.project_category_id ?? NaN)
  const clientId = Number(p.project_client_id ?? NaN)

  if (tag === 'actividad' || tag === 'actividades' || tag === 'activity') return true
  if (typeId === TYPE.ACTIVITIES || catId === TYPE.ACTIVITIES) return true
  if (clientId === 2) return true
  return false
}

export const isActive = (p: ProjectWithType): boolean => {
  const v = p.active
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v === 1
  if (typeof v === 'string') return v.trim().toLowerCase() === 'true'
  return false
}

const cmp = (a: string, b: string) =>
  a.localeCompare(b, 'es', { sensitivity: 'base', ignorePunctuation: true })

export const getProjectLabel = (p: IProject) => {
  const client =
    // preferido: anidado
    (p as any).client?.clientName ??
    // fallback: plano
    (p as any).client_name ??
    null

  return client ? `${client} - ${p.project_name}` : p.project_name
}


export function buildProjectOptGroups(projects: IProject[], showActiveOnly: boolean) {
  const filtered = projects.filter(p =>
    showActiveOnly ? isActive(p as ProjectWithType) : !isActive(p as ProjectWithType)
  )

  const buckets = {
    recurrent: filtered.filter(p => !isActivity(p as ProjectWithType) && isRecurrent(p as ProjectWithType))
                       .sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    polux:     filtered.filter(p => isPolux(p as ProjectWithType))
                       .sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    nonrec:    filtered.filter(p => !isActivity(p as ProjectWithType) && isNonRecurrent(p as ProjectWithType))
                       .sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
    activity:  filtered.filter(p => isActivity(p as ProjectWithType))
                       .sort((a, b) => cmp(getProjectLabel(a), getProjectLabel(b))),
  }

  return [
    { label: 'Recurrente',       options: buckets.recurrent.map(p => ({ label: getProjectLabel(p), value: p.id })) },
    { label: 'Proyecto Pólux',   options: buckets.polux.map(p => ({ label: getProjectLabel(p), value: p.id })) },
    { label: 'No recurrente',    options: buckets.nonrec.map(p => ({ label: getProjectLabel(p), value: p.id })) },
    { label: 'Actividades',      options: buckets.activity.map(p => ({ label: (p.client?.clientName ? getProjectLabel(p) : `Actividad - ${p.project_name}`), value: p.id })) },
  ]
}
