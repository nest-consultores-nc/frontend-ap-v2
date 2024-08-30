import { useEffect, useState } from 'react'
import { IDedicationsByMonth } from '../../interfaces/dedications/dedications.interfaces'
import { getAllUsersDedicationByMonth } from '../../api/dedications'

export default function MonitoringPage() {
  const [loading, setLoading] = useState(false)
  const [dedications, setDedications] = useState<IDedicationsByMonth[]>([])

  const dashboard =
    'https://app.powerbi.com/view?r=eyJrIjoiZDcwYmFkZjUtMDBkYS00ZjRjLWFiZWMtZjI1YWQxYzk1NDNmIiwidCI6ImQwZDljYzdlLTc3MzQtNGRjYS1hODZjLThlOTg3ZDhhOTQzYSJ9'

  useEffect(() => {
    const updateDedication = async () => {
      try {
        setLoading(true)
        const data = await getAllUsersDedicationByMonth(
          '/dedicacion-api/dedicaciones-por-mes',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0'
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
        width="1100px"
        height="600px"
        className="dashboard-view"
        src={dashboard}
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
                    <td className="px-6 py-4">
                      {new Date(project.week).toLocaleDateString()}
                    </td>
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
