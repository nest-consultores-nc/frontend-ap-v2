import { useEffect, useState } from 'react'
import { createClientQuery } from '../../api/clients'
import { Alerts } from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { HeaderPages } from '../../components/index'
interface ClientData {
  client_name: string
  client_description: string
}

export default function CreateClient() {
  const [alert, setAlert] = useState(false)
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const [data, setData] = useState<ClientData>({
    client_name: '',
    client_description: '',
  })

  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const token = localStorage.getItem('token')!
      const response = await createClientQuery(data, token)

      if (response?.success) {
        setError({
          success: true,
          msg: response.msg,
        })

        setData({
          client_name: '',
          client_description: '',
        })
      } else {
        setError({
          success: false,
          msg:
            response.msg ||
            'Ha ocurrido un error al intentar registrar al cliente',
        })
      }
    } catch (error) {
      console.log(error)
      setError({
        success: false,
        msg: 'Ha ocurrido un error al intentar registrar al cliente',
      })
    } finally {
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
        titlePage="Registrar Nuevo Cliente"
        subTitlePage="Por favor, ingresa los datos en los campos correspondientes."
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Nombre del Cliente
          </label>
          <div className="mt-2">
            <div className="flex shadow-sm">
              <input
                type="text"
                name="client_name"
                className="outline-none flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
                placeholder="Ingresa el nombre del cliente"
                value={data.client_name}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Descripción
          </label>
          <div className="mt-2">
            <textarea
              className="block outline-none w-full rounded-md border p-1 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
              placeholder="Describe brevemente al cliente"
              name="client_description"
              value={data.client_description}
              onChange={handleChange}
            ></textarea>
          </div>
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
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}
