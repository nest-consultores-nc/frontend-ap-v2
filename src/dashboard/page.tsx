'use client'
import { useEffect, useState } from 'react'
import { getDedicationByNameQuery } from '../api/dashboards'

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [dashboardUrl, setDashboardUrl] = useState<string>('')

  useEffect(() => {
    const getDashboardByName = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
          console.error('No se encontró el token en el localStorage')
          setLoading(false)
          return
        }

        const data = await getDedicationByNameQuery(
          'dashboards-api/get-dashboard/principal',
          token 
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
