import { getFinancialDashboard } from '../../../api/dashboards/financial'
import { useLiveData } from './useLiveData'

export { REFRESH_MS } from './useLiveData'

/** Datos del dashboard financiero, actualizados cada minuto (ver useLiveData) */
export const useFinancialData = () => useLiveData(getFinancialDashboard)
