import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoAgenciaPolux from '../../assets/logo-polux-sin-fondo.png'
import { isFormValid } from '../../functions/isFormValid'
import { HomeContext } from '../../context/HomeContext'
import { queryLogin } from '../../api/auth'
import { ILogin } from '../../interfaces/auth/auth.interface'
import { isLoginFormIsValid } from '../../functions/isLoginFormIsValid'
import clsx from 'clsx'
import { useAuthStore } from '../../store'
import { Loading } from '../../assets/Loading'

interface UserState {
  email: string
  password: string
}

export default function Login() {
  const authContext = useContext(HomeContext)
  const { setId, setEmail, setIsAuth, setToken, setRole, setName } =
    useAuthStore()

  const [, setAuth] = authContext ?? [
    { id: 0, isAuth: false, token: '', role: '', name: '', email: '' },
    () => {},
  ]
  const navigate = useNavigate()
  const [user, setUser] = useState<UserState>({ email: '', password: '' })
  const [errors, setErrors] = useState(false)
  const [loading, setLoading] = useState(false) 

  useEffect(() => {
    localStorage.clear()
  }, [])

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

    setLoading(true) 

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

        setId(id.toString())
        setEmail(email)
        setIsAuth(true)
        setToken(token)
        setRole(role)
        setName(name)

        setAuth({
          id,
          isAuth: true,
          token,
          role,
          name,
          email,
        })

        navigate('/dashboard')
      } else {
        setErrors(true)
      }
    } catch (error) {
      console.log(error)
      setErrors(true)
    } finally {
      setLoading(false) 
    }
  }

  return (
    <div className="flex min-h-full flex-col h-screen justify-center align-middle px-6 py-12 lg:px-8">
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
                placeholder="Ingrese su correo"
                autoComplete="email"
                required
                className="block w-full rounded-md border-2 px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
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
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                onChange={handleInputChange}
                className="block w-full rounded-md border-2 px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isLoginFormIsValid(user) || loading} 
              className={clsx(
                'flex w-full justify-center items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                {
                  'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600':
                    isLoginFormIsValid(user) && !loading,
                  'bg-gray-400 text-gray-300 cursor-not-allowed':
                    !isLoginFormIsValid(user) || loading,
                }
              )}
            >
              {loading ? (
                <>
                  Iniciar Sesión
                  <Loading />
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
          {errors && (
            <div className="bg-red-400 text-white p-1 text-sm rounded">
              Ha ocurrido un error al intentar iniciar sesión. Por favor,
              verifica tus credenciales e intenta nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
