import { useEffect, useState } from 'react'
import { Alerts, HeaderPages, LoadingSpinner } from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import {
  getAllOutlayData,
  getOutlayCategoriesQuery,
} from '../../api/outlay/get-outlay'
import { useAuthStore } from '../../store'
import {
  IOutlayCategoryDetail,
  IOutlayData,
  IOutlayTemporality,
  IOutlayType,
} from '../../interfaces/outlay/outlay.interface'
import { formatedNumber } from '../../functions/formatedCLPNumber'
import dayjs from 'dayjs'
import { getAllProjects } from '../../api/projects/get-projects'
import { IProject } from '../../interfaces/projects/projects.interface'
import { createOutlayQuery } from '../../api/outlay/post-outlay'
import { sanitizeAmount } from '../../functions/sanitizeAmount'
import { isFormValid } from '../../functions/isFormValid'

const token = localStorage.getItem('token')!
export default function OutlayPage() {
  const { id, email } = useAuthStore()
  const [outlayData, setOutlayData] = useState<IOutlayData>({
    typeId: '',
    projectOrCategoryId: '',
    amount: '',
    detail: '',
    date: dayjs().format('YYYY-MM-DD'),
    temporalityId: '',
    isProject: true,
  })
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<IProject[]>([])
  const [outlayCategories, setOutlayCategories] =
    useState<IOutlayCategoryDetail[]>()

  const [outlayTypes, setOutlayTypes] = useState<IOutlayType[]>()
  const [temporalities, setTemporalities] = useState<IOutlayTemporality[]>()
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
    const getOutlayData = async () => {
      const userId = id || localStorage.getItem('id')!
      const userEmail = email || localStorage.getItem('email')!
      try {
        const response = await getAllOutlayData(token, userId, userEmail)
        setOutlayTypes(response.outlayTypes)
        setTemporalities(response.outlayTemporalities)
      } catch (error) {
        console.log(error)
      }

      setLoading(false)
    }
    getOutlayData()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getAllProjects(localStorage.getItem('token')!, true)
        setProjects(data?.projects || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const getOutlayCategories = async () => {
      try {
        const response = await getOutlayCategoriesQuery(
          localStorage.getItem('token')!
        )
        setOutlayCategories(response.outlayCategories)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    getOutlayCategories()
  }, [])

  const handleChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value = event.target.value

    if (field === 'amount') {
      // Permitir solo números, puntos decimales y el signo negativo
      value = value.replace(/[^0-9.-]/g, '')

      // Asegurarnos de que solo haya un signo negativo y esté al inicio
      if (value.indexOf('-') > 0) {
        value = value.replace('-', '') // Remover cualquier signo '-' que no esté al inicio
      }

      // Aplicar el formato de número incluyendo el signo negativo
      if (value) {
        const isNegative = value[0] === '-'
        let numericValue = value.replace(/[^0-9]/g, '') // Quitar todo lo que no sea numérico
        numericValue = formatedNumber(numericValue) // Formatear el número (e.g., con comas)

        // Volver a agregar el signo negativo si era necesario
        value = isNegative ? `-${numericValue}` : numericValue
      }
    }

    setOutlayData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    outlayData.amount = sanitizeAmount(outlayData.amount)
    try {
      const response = await createOutlayQuery(token, outlayData)
      if (response.status === 200) {
        setAlert(true)
        setError({
          success: true,
          msg: response.msg,
        })
        setOutlayData({
          typeId: '',
          projectOrCategoryId: '',
          amount: '',
          detail: '',
          date: dayjs().format('YYYY-MM-DD'),
          temporalityId: '',
          isProject: true,
        })
      } else {
        setAlert(true)
        setError({
          success: false,
          msg: response.msg,
        })
      }
    } catch (error) {
      console.log(error)
      setAlert(true)
      setError({
        success: false,
        msg: 'Ha ocurrido un error inesperado',
      })
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
        titlePage="Ingresar nuevo desembolso"
        subTitlePage="Debes ingresar los datos en los campos respectivos"
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccionar Tipo de Desembolso
          </label>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <select
              onChange={(event) => handleChange('typeId', event)}
              value={outlayData.typeId}
              name="typeId"
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              {outlayTypes?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccionar la Categoría o Proyecto
          </label>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <select
              onChange={(event) => handleChange('projectOrCategoryId', event)}
              value={outlayData.projectOrCategoryId}
              name="projectOrCategoryId"
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              {outlayData.typeId === '1'
                ? projects?.map(({ id, client, project_name }) => (
                    <option key={id} value={id}>
                      {client.clientName} - {project_name}
                    </option>
                  ))
                : outlayCategories?.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
            </select>
          )}
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese Monto
          </label>
          <input
            type="text"
            name="amount"
            min={-1}
            value={outlayData.amount}
            onChange={(value) => handleChange('amount', value)}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese el Detalle
          </label>
          <input
            type="text"
            name="detail"
            value={outlayData.detail}
            onChange={(value) => handleChange('detail', value)}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese la Fecha
          </label>
          <input
            type="date"
            name="date"
            value={outlayData.date}
            onChange={(value) => handleChange('date', value)}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccionar la Temporalidad
          </label>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <select
              name="temporalityId"
              value={outlayData.temporalityId}
              onChange={(value) => handleChange('temporalityId', value)}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-2.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6"
            >
              <option value="" disabled>
                Seleccione una Temporalidad
              </option>
              {temporalities?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
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
          disabled={!isFormValid(outlayData)}
          className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isFormValid(outlayData)
              ? 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
              : 'bg-indigo-400 cursor-not-allowed'
          }`}
        >
          Guardar
        </button>
      </div>
    </form>
  )
}
