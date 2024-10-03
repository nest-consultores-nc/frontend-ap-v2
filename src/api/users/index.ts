import { IUserProfile } from '../../dashboard/edit-profile/page'
import { IUsers } from '../../interfaces/users/users.interface'

export const getAllUsers = async (path: string, token: string) => {
  const url = `https://agenciapolux-backend-production.up.railway.app/agencia-polux/api/v1/${path}`

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

    return data.users as IUsers[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching projects:', error.message)
    return []
  }
}
export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: IUserProfile // Hacer que 'data' sea opcional, para solicitudes GET donde no se necesita cuerpo.
): Promise<T | null> => {
  const url = `http://localhost:3002/agencia-polux/api/v1/${path}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined, // No enviar 'body' en métodos GET
    })

    const resp: T = await response.json()

    console.log(resp)

    return resp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return null
  }
}
