import { fetchFromApi } from './index'
import type { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'

export type IDedicationBasicInput = Pick<
  IDedicationsByUserId,
  'user_id' | 'project_id' | 'week' | 'dedicated'
> & {
  detail?: string
  end_of_week?: string       
  consolidation?: boolean   
}

 
function fmtYMD(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
function parseYMDLocal(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function computeFridayLocal(mondayStr: string) {
  const d = parseYMDLocal(mondayStr); d.setDate(d.getDate() + 4); return fmtYMD(d)
}



export async function addDedication(
  token: string,
  input: IDedicationBasicInput
): Promise<{ id: number } | null> {

    const body = {
    ...input,
    
    week: typeof input.week === 'string' ? input.week.slice(0,10) : fmtYMD(parseYMDLocal(String(input.week))),
    end_of_week: input.end_of_week
        ? String(input.end_of_week).slice(0,10)
        : computeFridayLocal(typeof input.week === 'string' ? input.week.slice(0,10) : fmtYMD(parseYMDLocal(String(input.week)))),
    consolidation: true,
    dedicated: Number(input.dedicated ?? 0), 
    }


  return await fetchFromApi<{ id: number }>(
    'dedicacion-api/add-dedication',
    token,
    'POST',
    body
  )
}


export async function updateDedication(
  token: string,
  id: number,
  input: Partial<IDedicationBasicInput>
): Promise<{ id: number } | null> {
 
    const body = {
    ...input,
    week: input.week == null
        ? undefined
        : (typeof input.week === 'string'
            ? input.week.slice(0,10)
            : fmtYMD(parseYMDLocal(String(input.week)))),
    end_of_week: input.end_of_week == null
        ? (input.week
            ? computeFridayLocal(typeof input.week === 'string'
                ? input.week.slice(0,10)
                : fmtYMD(parseYMDLocal(String(input.week))))
            : undefined)
        : String(input.end_of_week).slice(0,10),
    consolidation: true,
    dedicated: input.dedicated == null ? undefined : Number(input.dedicated), 
    }


  return await fetchFromApi<{ id: number }>(
    `dedicacion-api/update-dedication/${id}`,
    token,
    'PUT',
    body
  )
}


export async function deleteDedication(
  token: string,
  id: number
): Promise<null | {}> {
  return await fetchFromApi(
    `dedicacion-api/delete-dedication/${id}`,
    token,
    'DELETE'
  )
}
