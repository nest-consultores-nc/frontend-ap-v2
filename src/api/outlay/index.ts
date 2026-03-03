import { getBaseUrl } from "../auth/index"

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        method === 'POST' || method === 'PUT'
          ? JSON.stringify(body)
          : method === 'PATCH'
          ? body
          : null,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    if (method === 'GET') {
      return response.json()
    }

    if (method === 'POST') {
      const data = await response.json()
      return { msg: data.msg, status: response.status } as T
    }
    if (response.status === 204) return { status: 204 } as T
    return response.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    throw error
  }
}
