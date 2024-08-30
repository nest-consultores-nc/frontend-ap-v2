import { useEffect, useState } from 'react'
import { IProject } from '../../interfaces/projects/projects.interface'
import { getAllProjects } from '../../api/projects/get-projects'
import { deleteProjectQuery } from '../../api/projects/delete-projects'
import { Alerts, LoadingSpinner } from '../../components'
import HeaderPages from '../../components/HeaderPages/HeaderPages'

export default function FinishProject() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<IProject[]>([])
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })

  const [selectedDeleteProject, setSelectedDeleteProject] = useState<number>()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getAllProjects(
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0', // Token de autenticación
          true
        )
        setProjects(data.projects)
      } catch (error) {
        setError({ success: false, msg: 'Error al cargar los datos' })
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeleteProject(Number(event.target.value))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setAlert(false)

      const response = await deleteProjectQuery(
        selectedDeleteProject!,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzbHVnIjoiYWRtaW4iLCJuYW1lIjoiTmVzdCBBZG1pbiIsImVtYWlsIjoibmVzdEBhZ2VuY2lhcG9sdXguY2wiLCJpYXQiOjE3MjMzOTY0MTAsImV4cCI6MTcyNTk4ODQxMH0.MHTE95G-OdsjKwzyJmqLPGJJrjwzZ41R0SpUYmAcsz0'
      )

      setError({ success: response.success, msg: response.msg })
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== selectedDeleteProject)
      )

      setAlert(true)
    } catch (error) {
      console.log(error)
      setError({ success: false, msg: 'Error al enviar el formulario.' })
      setAlert(true)
    }
  }

  const handleCloseAlert = () => {
    setAlert(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {alert && (
        <Alerts
          message={
            error.success === false
              ? 'Ha ocurrido un error: '
              : 'Se ha terminado el proyecto:'
          }
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}
      <HeaderPages
        titlePage="Terminar Proyecto"
        subTitlePage="Debes seleccionar el proyecto que desees terminar. Este no se borrará de los registros, pero ya no podrán ingresar dedicaciones."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Seleccione el Proyecto
            </label>
            <div className="mt-2">
              <select
                value={selectedDeleteProject ?? ''}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="" disabled>
                  Seleccione un proyecto
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.client.clientName} - {project.project_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          disabled={!selectedDeleteProject || selectedDeleteProject === 0}
        >
          Confirmar
        </button>
      </div>
    </form>
  )
}
