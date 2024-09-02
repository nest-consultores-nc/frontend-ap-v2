import {
  IDashboard,
  IDashboardResponse,
} from '@/app/interfaces/dashboards/dashboards.interface'

export const getDedicationByNameQuery = async (
  path: string,
  token: string
): Promise<IDashboard> => {
  const url = `http://localhost:3002/agencia-polux/api/v1/${path}`

  console.log(url)

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
  } catch (error: any) {
    console.error('Error fetching dashboard:', error.message)
    throw error
  }
}
