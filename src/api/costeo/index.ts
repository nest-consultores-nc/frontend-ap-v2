export const fetchFromApiCosteo = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET'
): Promise<T> => {
  const url = `https://costeo-ap-production.up.railway.app/${path}`
  try {
    const response = await fetch(url, {
      method,
    })

    console.log(response)

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    console.log(response)

    return response.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error) // Log the full error
    throw error
  }
}
