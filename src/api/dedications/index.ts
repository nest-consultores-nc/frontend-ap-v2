import { IDedicationsByMonth } from '../../interfaces/dedications/dedications.interfaces'

export const getAllUsersDedicationByMonth = async (
  path: string,
  token: string
) => {
  const url = `http://localhost:3002/agencia-polux/api/v1/${path}`

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

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
): Promise<T | null> => {
  const url = `http://localhost:3002/agencia-polux/api/v1/${path}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body:
        method === 'POST'
          ? JSON.stringify(body)
          : method === 'PATCH'
          ? JSON.stringify(body)
          : null,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return null
  }
}
