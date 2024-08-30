'use client'
import { useEffect, useState } from 'react'
import { getDedicationByNameQuery } from '../api/dashboards'
import { IDashboardResponse } from '../interfaces/dashboards/dashboards.interface'

export default function Page() {
  const [loading, setLoading] = useState(true)
  const [dashboardUrl, setDashboardUrl] = useState<string>('')

  useEffect(() => {
    const getDashboardByName = async () => {
      try {
        setLoading(true)
        const data = await getDedicationByNameQuery(
          'dashboards-api/get-dashboard/principal',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0'
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
