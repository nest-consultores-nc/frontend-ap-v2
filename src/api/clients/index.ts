import { IClient } from '../../interfaces/clients'

type ApiResponse<T> = {
  success: boolean
  msg: string
  data?: T
}

type ClientListResponse = {
  clients: IClient[]
}

type ClientCreationResponse = ApiResponse<null>

export const fetchFromApi = async <T>(
  path: string,
  token: string,
  method: 'GET' | 'POST' = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any
): Promise<ApiResponse<T>> => {
  const url = `https://agenciapolux-backend-production.up.railway.app/agencia-polux/api/v1/${path}`

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    })

    const jsonResponse = await response.json()

    if (!response.ok) {
      return {
        success: false,
        msg:
          jsonResponse.msg ||
          `Error: ${response.status} ${response.statusText}`,
      }
    }

    return { success: true, msg: jsonResponse.msg, data: jsonResponse as T }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error fetching from ${path}:`, error.message)
    return { success: false, msg: 'Error fetching data from the server' }
  }
}

export const getAllClients = (
  token: string
): Promise<ApiResponse<ClientListResponse>> =>
  fetchFromApi<ClientListResponse>('/clientes-api/all-clients', token)

interface ClientData {
  client_name: string
  client_description: string
}

export const createClientQuery = (
  data: ClientData,
  token: string
): Promise<ClientCreationResponse> =>
  fetchFromApi<null>('clientes-api/create-client', token, 'POST', data)
