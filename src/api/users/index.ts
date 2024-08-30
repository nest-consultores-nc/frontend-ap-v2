import { IUsers } from '@/app/interfaces/users/users.interface'

export const getAllUsers = async (path: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/${path}`

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
  } catch (error: any) {
    console.error('Error fetching projects:', error.message)
    return []
  }
}
export const fetchFromApi = async <T>(
  path: string,
  token: string
): Promise<T | null> => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL_BACKEND}/${path}`

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

    return response.json()
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return null
  }
}
