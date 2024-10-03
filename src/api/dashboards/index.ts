import {
  IDashboard,
  IDashboardResponse,
} from '../../interfaces/dashboards/dashboards.interface'

export const getDedicationByNameQuery = async (
  path: string,
  token: string
): Promise<IDashboard> => {
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

    const data: IDashboardResponse = await response.json()

    return data.dashboard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching dashboard:', error.message)
    throw error
  }
}
