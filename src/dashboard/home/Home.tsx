import { useEffect, useState } from 'react'
import { getDedicationByNameQuery } from '../../api/dashboards'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [dashboardUrl, setDashboardUrl] = useState<string>('')

  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)

    // Validamos que solo el admin y la directora ejecutiva puedan entrar aquí
    const role = localStorage.getItem('role')
    if (role !== 'admin' && role !== 'directoraejecutiva')
      navigate('/dashboard/proyectos')
  }, [navigate])

  useEffect(() => {
    const getDashboardByName = async () => {
      try {
        setLoading(true)
        const data = await getDedicationByNameQuery(
          'dashboards-api/get-dashboard/principal',
          localStorage.getItem('token')!
        )

        if (data && data.url) {
          setDashboardUrl(data.url)
        }
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    getDashboardByName()
  }, [])

  return (
    <div className="flex w-full justify-center flex-col">
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <iframe
          src={dashboardUrl}
          height="600px"
          title="Reporte Agencia Polux"
          allowFullScreen={true}
        ></iframe>
      )}
    </div>
  )
}
