import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { useAuthStore } from '../../store'
import { editProfileQuery } from '../../api/users/put-users-api'
import { Alerts, HeaderPages } from '../../components'

export interface IUserProfile {
  id: string
  username: string
  email: string
  currentPassword: string
  password: string
}

export default function EditProfile() {
  const navigate = useNavigate()
  const [alert, setAlert] = useState(false)
  const {
    id,
    email,
    name,
    token,
    setId,
    setEmail,
    setIsAuth,
    setToken,
    setRole,
    setName,
  } = useAuthStore()
  const [error, setError] = useState({
    success: false,
    msg: '',
  })
  const [profileData, setProfileData] = useState<IUserProfile>({
    id: id || localStorage.getItem('id')!,
    username: localStorage.getItem('name') || name,
    email: localStorage.getItem('email') || email,
    currentPassword: '',
    password: '',
  })

  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleCloseAlert = () => {
    setAlert(false)
  }

  const editProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const authToken = localStorage.getItem('token') || token

    try {
      const response = await editProfileQuery(profileData, authToken)
      if (response.success) {
        setError(response)
        setError({
          success: response.success,
          msg: 'Su contraseña ha sido cambiada exitosamente. Ahora, deberá volver a iniciar sesión',
        })

        setTimeout(() => {
          localStorage.clear()

          setId('')
          setEmail('')
          setIsAuth(false)
          setToken('')
          setRole('')
          setName('')
          navigate('/iniciar-sesion')
        }, 3000)
      } else {
        setError({
          success: response.success,
          msg:
            response.msg ||
            'Ha ocurrido un error al intentar cambiar su contraseña',
        })
      }
    } catch (error) {
      console.log(error)
      setError({
        success: false,
        msg: 'Ha ocurrido un error al intentar cambiar su contraseña',
      })
    } finally {
      setAlert(true)
    }
  }

  return (
    <form onSubmit={editProfileSubmit}>
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
        titlePage="Editar mi Perfil"
        subTitlePage="Recuerda que para cambiar tu contraseña debes ingresar la actual"
      />

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Nombre
          </label>
          <input
            type="text"
            name="username"
            disabled
            value={profileData.username!}
            className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Correo Electrónico
          </label>
          <input
            type="text"
            name="username"
            disabled
            value={profileData.email!}
            className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
            placeholder="Ingresa el nombre del proyecto"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Contraseña Actual
          </label>
          <input
            type="password"
            name="currentPassword"
            value={profileData.currentPassword}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                currentPassword: e.target.value,
              })
            }
            className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
            placeholder="Ingresa tu contraseña actual"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Nueva Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={profileData.password}
            onChange={(e) =>
              setProfileData({ ...profileData, password: e.target.value })
            }
            className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
            placeholder="Ingresa tu nueva contraseña"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
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
