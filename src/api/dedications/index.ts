import { IDedicationsByMonth } from '../../interfaces/dedications/dedications.interfaces'
import { getBaseUrl } from './../auth/index'

export * from './read'
export * from './mutate'

export const getAllUsersDedicationByMonth = async (
  path: string,
  token: string
) => {
  const url = `${getBaseUrl()}/${path.replace(/^\//, '')}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return data.dedications as IDedicationsByMonth[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching projects:', error.message)
    return []
  }
}

// (tu) src/api/dedications/index.ts  — fragmento
export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T | null> => {
  const url = `${getBaseUrl()}/${path}`

  try {
    const hasBody = method === 'POST' || method === 'PATCH' || method === 'PUT'
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: hasBody ? JSON.stringify(body ?? {}) : undefined,
    })

    
    const text = await response.text()
    return text ? (JSON.parse(text) as T) : ({} as T)
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return null
  }
}
