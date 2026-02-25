import { fetchFromApi } from './index' 
import type {
  IDedicationsByUserId,
} from '../../interfaces/dedications/dedications.interfaces'


export async function getDedications(token: string): Promise<any[]> {
  const res = await fetchFromApi<{ data?: any[] } | any[]>(
    'dedicacion-api/get-dedications',
    token,
    'GET'
  )
  
  if (res && Array.isArray((res as any).data)) return (res as any).data
  if (Array.isArray(res)) return res
  return []
}

export async function getDedicationById(
  token: string,
  id: number
): Promise<IDedicationsByUserId | any | null> {
  const res = await fetchFromApi<{ data?: any } | any>(
    `dedicacion-api/get-dedication/${id}`,
    token,
    'GET'
  )
  return (res as any)?.data ?? res ?? null
}
