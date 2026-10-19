import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { MonitoringDashboard } from './monitoreo/MonitoringDashboard'

/** Monitoreo de dedicación: reemplaza el reporte de Power BI incrustado */
export default function MonitoringPage() {
  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  return <MonitoringDashboard />
}
