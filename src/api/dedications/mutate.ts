// src/api/dedications/mutate.ts
import { fetchFromApi } from './index'
import type { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'

// Estructura mínima para el CRUD básico.
// Ajusta si tu backend requiere otros campos (ej: user_id obligatorio, etc.)
export type IDedicationBasicInput = Pick<
  IDedicationsByUserId,
  'user_id' | 'project_id' | 'week' | 'dedicated'
> & {
  detail?: string
  end_of_week?: string        // YYYY-MM-DD
  consolidation?: boolean     // true
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
function toMondayLocal(ymd: string) {
  const d = parseYMDLocal(ymd); const day = d.getDay() || 7; if (day !== 1) d.setDate(d.getDate() - (day - 1)); return fmtYMD(d)
}
function computeFridayLocal(mondayStr: string) {
  const d = parseYMDLocal(mondayStr); d.setDate(d.getDate() + 4); return fmtYMD(d)
}


// ADD
export async function addDedication(
  token: string,
  input: IDedicationBasicInput
): Promise<{ id: number } | null> {
  // Normaliza week en 'YYYY-MM-DD' si llega Date
    // addDedication
    const body = {
    ...input,
    // Ya viene normalizado desde el hook (YYYY-MM-DD lunes)
    week: typeof input.week === 'string' ? input.week.slice(0,10) : fmtYMD(parseYMDLocal(String(input.week))),
    end_of_week: input.end_of_week
        ? String(input.end_of_week).slice(0,10)
        : computeFridayLocal(typeof input.week === 'string' ? input.week.slice(0,10) : fmtYMD(parseYMDLocal(String(input.week)))),
    consolidation: true,
    dedicated: Number(input.dedicated ?? 0), // 👈 ya es fracción 0..1
    }


  return await fetchFromApi<{ id: number }>(
    'dedicacion-api/add-dedication',
    token,
    'POST',
    body
  )
}

// UPDATE
export async function updateDedication(
  token: string,
  id: number,
  input: Partial<IDedicationBasicInput>
): Promise<{ id: number } | null> {
    // updateDedication
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
    dedicated: input.dedicated == null ? undefined : Number(input.dedicated), // fracción
    }


  return await fetchFromApi<{ id: number }>(
    `dedicacion-api/update-dedication/${id}`,
    token,
    'PUT',
    body
  )
}

// DELETE
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
