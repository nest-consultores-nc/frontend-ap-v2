export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
): Promise<T> => {
  const url = `https://agenciapolux-backend-production.up.railway.app/agencia-polux/api/v1/${path}`

  console.log(url)

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
          ? body
          : null,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    throw error
  }
}
