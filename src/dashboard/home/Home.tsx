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
    <div className="flex w-full justify-center flex-col mt-12 md:mt-0">
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : (
          <iframe
            src={dashboardUrl}
            className="w-full h-[400px] md:h-[600px] lg:h-[800px]"
            title="Reporte Agencia Polux"
            allowFullScreen={true}
          ></iframe>
        )}


    </div>
  )
}
