import { useEffect, useState } from 'react'
import { IDedicationsByMonth } from '../../interfaces/dedications/dedications.interfaces'
import { getAllUsersDedicationByMonth } from '../../api/dedications'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { getDedicationByNameQuery } from '../../api/dashboards'

export default function MonitoringPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dedications, setDedications] = useState<IDedicationsByMonth[]>([])

  const [dashboardUrl, setDashboardUrl] = useState<string>('')
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
    const getDashboardByName = async () => {
      try {
        setLoading(true)
        const data = await getDedicationByNameQuery(
          'dashboards-api/get-dashboard/monitoreo',
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

  useEffect(() => {
    const updateDedication = async () => {
      try {
        setLoading(true)
        const data = await getAllUsersDedicationByMonth(
          '/dedicacion-api/dedicaciones-por-mes',
          localStorage.getItem('token')!
        )

        setDedications(data)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    updateDedication()
  }, [])

  return (
    <div className="flex w-full justify-center flex-col">
      <iframe
        src={dashboardUrl}
        height="600px"
        title="Reporte Agencia Polux"
        allowFullScreen={true}
      ></iframe>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        dedications.map((dedication) => (
          <div
            key={dedication.user}
            className="border relative sm:rounded-lg my-4"
          >
            <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
              {dedication.user}
            </p>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nombre Proyecto
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Dedicación
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Semana
                  </th>
                </tr>
              </thead>
              <tbody>
                {dedication.dedications.map((project) => (
                  <tr key={project.id}>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {project.project_name}
                    </th>
                    <td className="px-6 py-4">{project.client_name}</td>
                    <td className="px-6 py-4">{project.dedicated * 100} %</td>
                    <td className="px-6 py-4">{project.week.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
