import { getBaseUrl } from "../auth/index"

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${getBaseUrl()}/${path}`

  try {
    const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH'
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: hasBody ? JSON.stringify(body ?? {}) : undefined,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Error ${response.status} ${response.statusText} – ${text}`)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : ({} as T)
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error?.message ?? error)
    throw error
  }
}