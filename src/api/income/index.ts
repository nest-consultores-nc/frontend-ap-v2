export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const url = `https://agenciapolux-backend-production.up.railway.app/agencia-polux/api/v1/${path}`

  try {
    const mustHaveJsonBody = method === 'POST' || method === 'PUT' || method === 'PATCH'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: mustHaveJsonBody ? JSON.stringify(body ?? {}) : undefined,
    })

    if (!response.ok) {
     
      let errorDetail = ''
      try {
        const errJson = await response.clone().json()
        errorDetail = typeof errJson === 'string' ? errJson : JSON.stringify(errJson)
      } catch {
        try {
          errorDetail = await response.clone().text()
        } catch { /* ignore */ }
      }
      const err: any = new Error(`HTTP ${response.status} ${response.statusText}${errorDetail ? ` – ${errorDetail}` : ''}`)
      err.status = response.status
      err.body = errorDetail
      throw err
    }

    if (response.status === 204) return {} as T
    return response.json()
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error?.message ?? error)
    throw error
  }
}
