import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { FinancialDashboard } from './financiero/FinancialDashboard'

export default function Home() {
  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)

    const role = localStorage.getItem('role')
    if (role !== 'admin' && role !== 'directoraejecutiva')
      navigate('/dashboard/proyectos')
  }, [navigate])

  return <FinancialDashboard />
}
