import { useEffect, useState } from 'react'
import { IClient } from '../../interfaces/clients'
import { ICategory } from '../../interfaces/projects/project-category.interface'
import { IType } from '../../interfaces/projects/project-type.interface'
import { IProjectData } from '../../interfaces/projects/project-form.interface'
import { getAllClients } from '../../api/clients'
import {
  getCategoriesProjectsQuery,
  getTypesProjectsQuery,
} from '../../api/projects/get-projects'
import { createProjectQuery } from '../../api/projects/post-projects'
import { Alerts, InputSelect } from '../../components'
import { useNavigate } from 'react-router-dom'
import { isFormValid } from '../../functions/isFormValid'
import { HeaderPages } from '../../components'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

interface ProjectFormData {
  types: IType[]
  categories: ICategory[]
  clients: IClient[]
}

export default function CreateProject() {
  const navigate = useNavigate()
  const [data, setData] = useState<ProjectFormData>({
    types: [],
    categories: [],
    clients: [],
  })
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const [projectData, setProjectData] = useState<IProjectData>({
    project_name: '',
    description: '',
    project_type_id: 0,
    project_category_id: 0,
    project_client_id: 0,
    project_or_activity: 'proyecto',
  })

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
    const fetchData = async () => {
      setError({ success: false, msg: '' })

      const token = localStorage.getItem('token')!
      try {
        const [clientsResponse, typesResponse, categoriesResponse] =
          await Promise.all([
            getAllClients(token),
            getTypesProjectsQuery(token),
            getCategoriesProjectsQuery(token),
          ])

        setData({
          clients: clientsResponse?.data?.clients || [],
          types: typesResponse?.types || [],
          categories: categoriesResponse?.categories || [],
        })
      } catch (error) {
        console.error(error)

        setError({
          success: false,
          msg: 'Ocurrió un error al cargar los datos.',
        })
      }
    }

    fetchData()
  }, [])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setProjectData({
      ...projectData,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setAlert(false)
      if (projectData.project_type_id === 4) {
        projectData.project_or_activity = 'actividad'
      }
      projectData.project_client_id = Number(projectData.project_client_id)
      projectData.project_type_id = Number(projectData.project_type_id)
      projectData.project_category_id = Number(projectData.project_category_id)

      const response = await createProjectQuery(
        projectData,
        localStorage.getItem('token')!
      )

      setError({ success: response.success, msg: response.msg })
      setAlert(true)
      setProjectData({
        project_name: '',
        description: '',
        project_type_id: 0,
        project_category_id: 0,
        project_client_id: 0,
        project_or_activity: '',
      })
    } catch (error) {
      console.error(error)
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
              : 'Registro Exitoso:'
          }
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}
      <HeaderPages
        titlePage="Registrar Nuevo Proyecto"
        subTitlePage="Crea un nuevo proyecto para tu organización."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese Nombre del Proyecto
          </label>
          <input
            type="text"
            name="project_name"
            value={projectData.project_name}
            onChange={handleChange}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Descripción del Proyecto
          </label>
          <textarea
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-400  sm:text-sm sm:leading-6"
            placeholder="Describe brevemente el proyecto"
            name="description"
            value={projectData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccione el Cliente
          </label>
          <select
            name="project_client_id"
            value={projectData.project_client_id}
            onChange={handleChange}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
          >
            <option value="">Seleccione un cliente</option>
            {data.clients.map(({ id, client_name }) => (
              <option key={id} value={id}>
                {client_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-full">
          {data.types && (
            <InputSelect
              title="Tipo de Proyecto"
              defaultOption="Seleccione el Tipo de Proyecto"
              options={data.types}
              name="project_type_id"
              value={projectData.project_type_id}
              onChange={handleChange}
            />
          )}
        </div>

        <div className="col-span-full">
          {data.categories && (
            <InputSelect
              title="Seleccione la Categoría del Proyecto"
              defaultOption="Seleccione la Categoría del Proyecto"
              options={data.categories}
              name="project_category_id"
              value={projectData.project_category_id}
              onChange={handleChange}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          disabled={!isFormValid(projectData)}
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
    ${
      isFormValid(projectData)
        ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
    }`}
        >
          Guardar
        </button>
      </div>
      
    </form>
  )
}
