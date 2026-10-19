import { IFinancialDashboard } from '../../interfaces/dashboards/financial.interface'
import { getBaseUrl } from '../auth/index'

export const getFinancialDashboard = async (
  token: string,
  signal?: AbortSignal
): Promise<IFinancialDashboard> => {
  const response = await fetch(`${getBaseUrl()}/dashboards-api/financiero`, {
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

  return data as IFinancialDashboard
}
