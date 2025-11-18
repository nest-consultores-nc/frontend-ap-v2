import { useNavigate } from 'react-router-dom'
import { useEffect, useState, ChangeEvent } from 'react'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { useAuthStore } from '../../store'
import { editProfileQuery } from '../../api/users/put-users-api'
import { Alerts, HeaderPages } from '../../components'
import Swal from 'sweetalert2'

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

  const [submitting, setSubmitting] = useState(false)
  const [profileData, setProfileData] = useState<IUserProfile>({
    id: id || localStorage.getItem('id')!,
    username: localStorage.getItem('name') || name,
    email: localStorage.getItem('email') || email,
    currentPassword: '',
    password: '',
  })

  // --- NUEVO: política de contraseña y estado de validación ---
  type PwdChecks = {
    length: boolean
    noSpace: boolean
    lower: boolean
    upper: boolean
    digit: boolean
    symbol: boolean
    valid: boolean
  }

  const passwordPolicy = {
    length: (s: string) => s.length >= 8 && s.length <= 64,
    noSpace: (s: string) => !/\s/.test(s),
    lower: (s: string) => /[a-z]/.test(s),
    upper: (s: string) => /[A-Z]/.test(s),
    digit: (s: string) => /[0-9]/.test(s),
    symbol: (s: string) => /[^A-Za-z0-9]/.test(s),
  }

  const validatePassword = (pwd: string): PwdChecks => {
    const checks = {
      length: passwordPolicy.length(pwd),
      noSpace: passwordPolicy.noSpace(pwd),
      lower: passwordPolicy.lower(pwd),
      upper: passwordPolicy.upper(pwd),
      digit: passwordPolicy.digit(pwd),
      symbol: passwordPolicy.symbol(pwd),
    }
    return { ...checks, valid: Object.values(checks).every(Boolean) }
  }

  const getStrengthScore = (pwd: string) => {
    const c = validatePassword(pwd)
    return ['length','noSpace','lower','upper','digit','symbol']
      .reduce((acc, k) => acc + (c[k as keyof PwdChecks] ? 1 : 0), 0) // 0–6
  }

  const [pwdChecks, setPwdChecks] = useState<PwdChecks>({
    length: false, noSpace: false, lower: false, upper: false, digit: false, symbol: false, valid: false
  })
  const [pwdStrength, setPwdStrength] = useState(0)


  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleCloseAlert = () => {
    setAlert(false)
  }

  const editProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const confirm = await Swal.fire({
      title: '¿Actualizar contraseña?',
      text: 'Se cambiará tu contraseña y deberás iniciar sesión nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3E3378',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    })

    if (!confirm.isConfirmed) return

    const authToken = localStorage.getItem('token') || token
    setSubmitting(true)
    try {
      const response = await editProfileQuery(profileData, authToken)
      if (response.success) {
        setError({
          success: true,
          msg: 'Su contraseña ha sido cambiada exitosamente. Ahora, deberá volver a iniciar sesión',
        })
        setAlert(true)

        await Swal.fire({
          title: '¡Contraseña actualizada!',
          text: 'Debes volver a iniciar sesión.',
          icon: 'success',
          confirmButtonColor: '#3E3378',
          confirmButtonText: 'Aceptar',
        })

        localStorage.clear()
        setId('')
        setEmail('')
        setIsAuth(false)
        setToken('')
        setRole('')
        setName('')
        navigate('/iniciar-sesion')
      } else {
        setError({
          success: false,
          msg: response.msg || 'Ha ocurrido un error al intentar cambiar su contraseña',
        })
        setAlert(true)

        await Swal.fire({
          title: 'No se pudo actualizar',
          text: response.msg || 'Revisa los datos ingresados e inténtalo nuevamente.',
          icon: 'warning',
          confirmButtonColor: '#3E3378',
          confirmButtonText: 'Entendido',
        })
      }
    } catch (error) {
      console.log(error)
      setError({
        success: false,
        msg: 'Ha ocurrido un error al intentar cambiar su contraseña',
      })
      setAlert(true)

      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al intentar cambiar su contraseña',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Cerrar',
      })
    } finally {
      setSubmitting(false)
    }
  }
  const canSubmit =
    !!profileData.currentPassword.trim() &&
    !!profileData.password.trim() &&
    pwdChecks.valid

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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setProfileData({ ...profileData, currentPassword: e.target.value })
              }
              onKeyDown={(e) => { if (e.key === ' ') e.preventDefault() }}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña actual"
              className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const sanitized = e.target.value.replace(/\s/g, '')
                  setProfileData({ ...profileData, password: sanitized })
                  const checks = validatePassword(sanitized)
                  setPwdChecks(checks)
                  setPwdStrength(getStrengthScore(sanitized))
                }}
                onKeyDown={(e) => { if (e.key === ' ') e.preventDefault() }}
                autoComplete="new-password"
                placeholder="Ingresa tu nueva contraseña"
                className="mt-2 outline-none w-full flex-1 rounded border bg-transparent p-1 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:border-gray-400"
              />


              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className="h-2 rounded transition-all"
                    style={{
                      width: `${(pwdStrength / 6) * 100}%`,
                      backgroundColor:
                        pwdStrength <= 2 ? '#ef4444' : pwdStrength <= 4 ? '#f59e0b' : '#10b981'
                    }}
                    aria-label="Fortaleza de la contraseña"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Fuerza: {pwdStrength <= 2 ? 'Débil' : pwdStrength <= 4 ? 'Media' : 'Fuerte'}
                </div>
              </div>

              {/* Políticas */}
              <div className="mt-3 text-sm">
                <div className="font-medium text-gray-900">La contraseña debe tener:</div>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.length ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.length ? '✓' : '✗'}
                    </span>
                    Entre 8 y 64 caracteres
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.noSpace ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.noSpace ? '✓' : '✗'}
                    </span>
                    Sin espacios en blanco
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.lower ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.lower ? '✓' : '✗'}
                    </span>
                    Al menos una minúscula (a–z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.upper ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.upper ? '✓' : '✗'}
                    </span>
                    Al menos una mayúscula (A–Z)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.digit ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.digit ? '✓' : '✗'}
                    </span>
                    Al menos un número (0–9)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={pwdChecks.symbol ? 'text-green-600' : 'text-red-600'}>
                      {pwdChecks.symbol ? '✓' : '✗'}
                    </span>
                    Al menos un símbolo (!@#$…)
                  </li>
                </ul>
              </div>

            
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
            ${submitting || !canSubmit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#3E3378] text-white hover:bg-[#89CCDC] hover:text-black'}
          `}
        >
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>

      </div>
    </form>
  )
}
