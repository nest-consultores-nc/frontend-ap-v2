import { fetchFromApi } from '.'
import { IOutlay, IOutlayCategories } from '../../interfaces/outlay/outlay.interface'

export const getAllOutlayData = (token: string, userId: string, email: string) =>
  fetchFromApi<IOutlay>(`outlay-api/get-all-outlay-data/${userId}/${email}`, token)

export const getOutlayCategoriesQuery = (token: string) =>
  fetchFromApi<IOutlayCategories>('outlay-api/get-all-outlay-categories', token)


export const getOutlays = (token: string, params?: { limit?: number; offset?: number; q?: string }) => {
  const qs = new URLSearchParams()
  if (params?.limit != null) qs.set('limit', String(params.limit))
  if (params?.offset != null) qs.set('offset', String(params.offset))
  if (params?.q) qs.set('q', params.q)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return fetchFromApi<{ data: any[]; total: number; limit: number; offset: number }>(
    `outlay-api/get-outlays${suffix}`,
    token
  )
}

export const getOutlayById = (token: string, id: number) =>
  fetchFromApi<any>(`outlay-api/get-outlay/${id}`, token)
