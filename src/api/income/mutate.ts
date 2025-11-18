// src/api/income/mutate.ts
import { fetchFromApi } from '.'
import type { IIncome } from '../../interfaces/income/income.interface' // <-- tu interfaz

// DTO que espera el backend (camelCase y números)
type BackendIncomeDTO = {
  amount: number
  date: string                 // 'YYYY-MM-DD'
  detail: string
  temporalityId: number
  projectId: number | null
  month?: string | null
  uf?: number | null
}

function mapToBackendDTO(i: IIncome): BackendIncomeDTO {
  const toNum = (v: any) => {
    if (v === '' || v == null) return null
    const n = Number(String(v).replace(/[^\d.-]/g, ''))
    return Number.isFinite(n) ? n : null
  }

  const amount = toNum(i.amount)                   // string -> number | null
  const uf = toNum(i.uf)                           // string -> number | null
  const projectId = i.project_id == null ? null : Number(i.project_id)
  const temporalityId = Number(i.temporalities_id)

  // Normaliza fecha a 'YYYY-MM-01' si viene 'YYYY-MM'
  const date = (i.date?.length === 7)
    ? `${i.date}-01`
    : String(i.date ?? '').slice(0, 10)

  // ✅ definir detailNorm antes de usarlo
  const detailNorm = (i.detail ?? '').toString().trim()

    const ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

    function toMonYYYY(ym?: string | null) {
    if (!ym || !/^\d{4}-\d{2}$/.test(ym)) return null
    const [y, m] = ym.split('-')
    const idx = Number(m) - 1
    return `${ES[idx]}-${y.slice(-2)}`
    }

    // Deriva YM desde date si month viene vacío
    const ymFromDate = (() => {
    const raw = String(i.date ?? '')
    if (/^\d{4}-\d{2}$/.test(raw)) return raw
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.slice(0, 7)
    return null
    })()

    const ym = (i.month && i.month.trim() !== '') ? i.month : ymFromDate
    const monthOut = toMonYYYY(ym)  // 👈 'oct-2025'

    return {
    amount: amount ?? 0,
    date,
    detail: detailNorm,
    temporalityId,
    projectId,
    month: monthOut,   // 👈 ahora viaja 'oct-2025'
    uf: uf ?? 0,
    }

}


export const addIncome = (token: string, data: IIncome) => {
  const dto = mapToBackendDTO(data)

  
  // Guardas de seguridad (evitan 500)
    if (dto.amount == null || !Number.isFinite(dto.amount) || dto.amount < 0) {
    throw new Error('Monto inválido: debe ser numérico y ≥ 0')
    }

  if (!dto.temporalityId) throw new Error('Temporalidad requerida')
  if (dto.projectId == null || dto.projectId <= 0) throw new Error('Proyecto requerido')
  if (!dto.date) throw new Error('Fecha requerida')
  if (!dto.month) throw new Error('Mes requerido (YYYY-MM)')

  // Debug visible en consola
  console.debug('[POST /income-api/add-income] payload →', dto)
  return fetchFromApi<{ id: number }>('income-api/add-income', token, 'POST', dto)
}


export const updateIncome = (token: string, id: number, data: IIncome) =>
  fetchFromApi<{ status: number }>(`income-api/update-income/${id}`, token, 'PUT', mapToBackendDTO(data))

export const deleteIncome = (token: string, id: number) =>
  fetchFromApi<{ status: number }>(`income-api/delete-income/${id}`, token, 'DELETE')
