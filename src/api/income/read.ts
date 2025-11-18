// src/api/income/read.ts
import { fetchFromApi } from '.'

// 🔹 Lista paginada
export const getIncomes = (token: string, params?: { limit?: number; offset?: number; q?: string }) => {
  const qs = new URLSearchParams()
  if (params?.limit != null) qs.set('limit', String(params.limit))
  if (params?.offset != null) qs.set('offset', String(params.offset))
  if (params?.q) qs.set('q', params.q)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchFromApi<{ data: any[]; total: number; limit: number; offset: number }>(
    `income-api/get-incomes${suffix}`,
    token
  )
}

// 🔹 Uno por id
export const getIncomeById = (token: string, id: number) =>
  fetchFromApi<any>(`income-api/get-income/${id}`, token)

// 🔹 Catálogo temporalidades (ajusta al que tengas disponible)
export const getIncomeTemporalitiesQuery = (token: string) =>
  fetchFromApi<{ temporalities: Array<{ id: number; name: string; period: string }> }>(
    'income-api/get-all-income-temporalities',
    token
  )
