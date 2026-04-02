type ApiResponse<T> = {
  success: boolean
  msg: string
  data?: T
}


export const getBaseUrl = (): string => {
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'

  if (isDev) {
    return (
      import.meta.env.VITE_LOCAL_URL_BACKEND ||
      'http://localhost:3002/agencia-polux/api/v1'
    )
  }

   
  const prod = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL_BACKEND || import.meta.env.VITE_LOCAL_URL_BACKEND
  if (!prod || prod === 'undefined') {
    throw new Error('API base URL no configurada en producción. Define VITE_API_URL en tu entorno de build.')
  }
  return prod
}


export const queryLogin = async <T>(
  path: string,
  token: string = '',
  method: 'GET' | 'POST' = 'POST',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
): Promise<ApiResponse<T>> => {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/${path}`
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    })

    const jsonResponse = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear()
        window.location.href = '/iniciar-sesion'
        return { success: false, msg: '401' }
      }
      return {
        success: false,
        msg: jsonResponse.msg || `Error: ${response.status} ${response.statusText}`,
      }
    }

    return { success: true, msg: jsonResponse.msg, data: jsonResponse as T }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return { success: false, msg: 'Error fetching data from the server' }
  }
}

export const checkToken = async <T>(
  path: string,
  token: string = '',
  method: 'GET'
): Promise<ApiResponse<T>> => {
  const BASE = getBaseUrl()
  const url = `${BASE}/${path.replace(/^\//,'')}`

  const response = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status === 401) {
    return { success: false, msg: '401' } as any
  }

  const jsonResponse: any = await response.json().catch(() => ({}))
  const msg = jsonResponse.msg ?? jsonResponse.message ?? ''
  return { success: !!jsonResponse.success, msg, data: jsonResponse as T }
}
