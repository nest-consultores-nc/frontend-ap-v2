import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoAgenciaPolux from '../../assets/logo-polux-sin-fondo.png'
import { isFormValid } from '../../functions/isFormValid'
import { HomeContext } from '../../context/HomeContext'
import { queryLogin } from '../../api/auth'
import { ILogin } from '../../interfaces/auth/auth.interface'

interface UserState {
  email: string
  password: string
}

export default function Login() {
  const authContext = useContext(HomeContext)
  const [, setAuth] = authContext ?? [
    { id: 0, isAuth: false, token: '', role: '', name: '', email: '' },
    () => {},
  ]
  const navigate = useNavigate()
  const [user, setUser] = useState<UserState>({ email: '', password: '' })
  const [errors, setErrors] = useState(false) // State to track errors

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard/inicio')
    }
  }, [navigate])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isFormValid(user)) {
      setErrors(true)
      return
    }

    try {
      const response = await queryLogin<ILogin>(
        'iniciar-sesion',
        '',
        'POST',
        user
      )

      if (response.success && response.data) {
        const { token, user: userData } = response.data
        const { id, role, name, email } = userData

        localStorage.setItem('id', id.toString())
        localStorage.setItem('token', token)
        localStorage.setItem('name', name)
        localStorage.setItem('email', email)
        localStorage.setItem('role', role)

        setAuth({
          id,
          isAuth: true,
          token,
          role,
          name,
          email,
        })

        navigate('/dashboard/inicio')
      } else {
        setErrors(true)
      }
    } catch (error) {
      console.log(error)
      setErrors(true)
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-16 w-auto"
          src={LogoAgenciaPolux}
          alt="Logo Agencia Polux"
        />
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Ingrese su correo
            </label>
            <div className="mt-2">
              <input
                name="email"
                onChange={handleInputChange}
                type="email"
                value={user.email}
                required
                className="block w-full rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Contraseña
              </label>
            </div>
            <div className="mt-2">
              <input
                name="password"
                type="password"
                value={user.password}
                required
                onChange={handleInputChange}
                className="block w-full rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {errors && (
            <div className="text-red-600 text-sm mt-2">
              Ha ocurrido un error al intentar iniciar sesión. Por favor,
              verifica tus credenciales e intenta nuevamente.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!isFormValid(user)}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
