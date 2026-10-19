import { IMonitoringDashboard } from '../../interfaces/dashboards/monitoring.interface'
import { getBaseUrl } from '../auth/index'

export const getMonitoringDashboard = async (
  token: string,
  signal?: AbortSignal
): Promise<IMonitoringDashboard> => {
  const response = await fetch(`${getBaseUrl()}/dashboards-api/monitoreo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || data?.msg || `Error ${response.status} al cargar el dashboard`
    )
  }

  return data as IMonitoringDashboard
}
