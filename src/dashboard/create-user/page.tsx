'use client'
import { useEffect, useState } from 'react'
import { IRole, IWorkday } from '../../interfaces/roles/roles.interface'
import { getAllRolesAndWorkday } from '../../api/roles'
import { LoadingSpinner, HeaderPages } from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

const token = localStorage.getItem('token')!
export default function CreateUser() {
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<IRole[]>()
  const [workday, setWorkday] = useState<IWorkday[]>()

  const navigate = useNavigate()

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const { roles, workday } = await getAllRolesAndWorkday(
          'roles-api/roles',
          token
        )

        setRoles(roles)
        setWorkday(workday)
        console.log(roles, workday)
        setLoading(false)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  return (
    <form>
      <HeaderPages
        titlePage="Registrar Nuevo Usuario"
        subTitlePage="Crea un nuevo usuario para tu organización. Debes ingresar los datos en los campos respectivos"
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese Nombre del Usuario
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Correo Electrónico Asociado
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese RUT
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese Contraseña
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm  placeholder:text-gray-400  focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccione el Cargo
          </label>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <select className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6">
              {roles?.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccione la Jornada de Trabajo
          </label>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <select className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm   placeholder:text-gray-400 focus:border-gray-40  sm:text-sm sm:leading-6">
              {workday?.map(({ id, workday }) => (
                <option key={id} value={id}>
                  {workday}
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
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}
