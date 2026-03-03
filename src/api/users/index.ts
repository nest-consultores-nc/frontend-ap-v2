import { IUsers } from '../../interfaces/users/users.interface'
import { getBaseUrl } from './../../../src/api/auth/index'

export const getAllUsers = async (path: string, token: string): Promise<IUsers[]> => {
  try {
    const data = await fetchFromApi<{ users: IUsers[] }>(path, token, 'GET')
    return data.users ?? []
  } catch {
    return []
  }
}

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'PUT' | 'POST' | 'PATCH' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${getBaseUrl()}/${path}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body:
        method === 'POST' || method === 'PATCH' || method === 'PUT'
          ? JSON.stringify(body)
          : null,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    throw error
  }
}

export const toggleUserStatus = async (
  id: number,
  token: string
): Promise<{ success: boolean; msg: string; active?: number }> => {
  try {
    const data = await fetchFromApi<{ success: boolean; msg: string; active: number }>(
      'users-api/toggle-estado',
      token,
      'PATCH',
      { id }
    )
    return data
  } catch (error: any) {
    console.error('toggleUserStatus error:', error.message)
    return { success: false, msg: 'Error de conexión' }
  }
}