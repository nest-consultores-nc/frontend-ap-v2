import { useEffect, useState, ChangeEvent } from 'react'
import { IRole, IWorkday } from '../../interfaces/roles/roles.interface'
import { getAllRolesAndWorkday } from '../../api/roles'
import { LoadingSpinner, HeaderPages} from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { createUserAccount } from '../../api/users/post-user-api'
import { IUserForm } from '../../interfaces/users/users.interface'
import Swal from 'sweetalert2'

const initialUserState: IUserForm = {
  name: '',
  email: '',
  rut: '',
  password: '',
  role_id: '',
  workday_id: '',
  active: 1,
}

export default function CreateUser() {

  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<IRole[]>()
  const [workday, setWorkday] = useState<IWorkday[]>()
  const [user, setUser] = useState<IUserForm>(initialUserState)
  const [pwdChecks, setPwdChecks] = useState<PwdChecks>({
    length: false, noSpace: false, lower: false,
    upper: false, digit: false, symbol: false, valid: false
  })
  const [pwdStrength, setPwdStrength] = useState(0) 

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
          localStorage.getItem('token')!
        )

        setRoles(roles)
        setWorkday(workday)
        console.log(roles, workday)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    let nextValue = value

    
    if (name === 'password') {
      nextValue = value.replace(/\s/g, '')
      const checks = validatePassword(nextValue)
      setPwdChecks(checks)
      setPwdStrength(getStrengthScore(nextValue))
    }

    setUser(prev => ({ ...prev, [name]: nextValue }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

 
    const missing: string[] = []
    if (!user.name.trim()) missing.push('Nombre')
    if (!user.email.trim()) missing.push('Correo')
    if (!user.password.trim()) missing.push('Contraseña')

    if (missing.length > 0) {
      await Swal.fire({
        title: 'Faltan datos obligatorios',
        html: `
          <div style="text-align:left">
            Debes completar los siguientes campos:
            <ul style="margin-top:8px; padding-left:18px;">
              ${missing.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#CDEA80',
      })
      return
    }
    if (!pwdChecks.valid) {
      await Swal.fire({
        title: 'Contraseña inválida',
        html: `
          <div style="text-align:left">
            Debes cumplir todas las políticas de contraseña:<br/>
            • 8–64 caracteres<br/>
            • Sin espacios<br/>
            • Al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#CDEA80',
      })
      return
    }

    const roleName = roles?.find(r => String(r.id) === String(user.role_id))?.name || '(sin cargo)'
    const workdayName = workday?.find(w => String(w.id) === String(user.workday_id))?.workday || '(sin jornada)'

    const { isConfirmed } = await Swal.fire({
      title: '¿Deseas crear este usuario?',
      html: `
        <div style="text-align:left">
          <b>Nombre:</b> ${user.name || '(sin nombre)'}<br/>
          <b>Email:</b> ${user.email || '(sin email)'}<br/>
          <b>RUT:</b> ${user.rut || '(sin RUT)'}<br/>
          <b>Cargo:</b> ${roleName}<br/>
          <b>Jornada:</b> ${workdayName}<br/>
          <hr style="margin:10px 0;" />
          <i style="font-size:12px;">
            Nota: la contraseña definida es <b>temporal</b> y el usuario deberá cambiarla en su primer inicio de sesión en "¿Olvidaste tu contraseña?".
          </i>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#CDEA80',
      cancelButtonColor: '#FF735C',
    })

    if (!isConfirmed) return

    try {
      const response = await createUserAccount(
        { ...user, active: 1 },
        localStorage.getItem('token')!
      )

      if (response?.success) {
        await Swal.fire({
          title: '¡Registro exitoso!',
          text: response.msg || 'El usuario fue registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#CDEA80',
        })
        setUser(initialUserState) 
      } else {
        await Swal.fire({
          title: 'Error',
          text: response?.msg || 'Ha ocurrido un error al intentar registrar al usuario.',
          icon: 'error',
        })
      }
    } catch (error) {
      console.log(error)
      await Swal.fire({
        title: 'Error',
        text: 'Ha ocurrido un error al intentar registrar al usuario.',
        icon: 'error',
      })
    }
  }
   
  const passwordPolicy = {
    length: (s: string) => s.length >= 8 && s.length <= 64,
    noSpace: (s: string) => !/\s/.test(s),
    lower: (s: string) => /[a-z]/.test(s),
    upper: (s: string) => /[A-Z]/.test(s),
    digit: (s: string) => /[0-9]/.test(s),
    symbol: (s: string) => /[^A-Za-z0-9]/.test(s),
  }

  type PwdChecks = {
    length: boolean
    noSpace: boolean
    lower: boolean
    upper: boolean
    digit: boolean
    symbol: boolean
    valid: boolean
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
      .reduce((acc, k) => acc + (c[k as keyof PwdChecks] ? 1 : 0), 0)
  }
  
        const canSubmit =
          !!user.name.trim() &&
          !!user.email.trim() &&
          !!user.rut.trim() &&
          !!user.password.trim() &&
          pwdChecks.valid &&
          !!user.role_id &&
          !!user.workday_id

  return (
    <form onSubmit={handleSubmit}>
      
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
            name="name"
            value={user.name}
            onChange={handleChange}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="John Doe"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Correo Electrónico Asociado
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="johndoe@agenciapolux.com"
          />
        </div>
        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Ingrese RUT
          </label>
          <input
            type="text"
            name="rut"
            value={user.rut}
            onChange={handleChange}
            className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
            placeholder="12345678-9"
          />
        </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Ingrese Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === ' ') e.preventDefault() }}
              autoComplete="new-password"
              className="outline-none mt-2 block w-full rounded-md border px-2 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 sm:text-sm sm:leading-6"
              placeholder="********"
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

            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-semibold text-gray-900">Requisitos de seguridad</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.length 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.length 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.length ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.length ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    8-64 caracteres
                  </span>
                </div>

  
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.noSpace 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.noSpace 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.noSpace ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.noSpace ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    Sin espacios
                  </span>
                </div>

        
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.lower 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.lower 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.lower ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.lower ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    Minúscula (a-z)
                  </span>
                </div>

        
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.upper 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.upper 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.upper ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.upper ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    Mayúscula (A-Z)
                  </span>
                </div>

           
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.digit 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.digit 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.digit ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.digit ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    Número (0-9)
                  </span>
                </div>

          
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                  pwdChecks.symbol 
                    ? 'bg-green-50 border border-green-200' 
                    : 'white border border-gray-200'
                }`}>
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pwdChecks.symbol 
                      ? 'bg-green-500 text-[#303031]' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {pwdChecks.symbol ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${pwdChecks.symbol ? 'text-green-800 font-medium' : 'text-gray-600'}`}>
                    Símbolo (!@#$...)
                  </span>
                </div>
              </div>
            </div>
          </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Seleccione el Cargo
          </label>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <select
              name="role_id"
              value={user.role_id}
              onChange={handleChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-40 sm:text-sm sm:leading-6"
            >
              <option value="">Seleccione un cargo</option>
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
            <select
              name="workday_id"
              value={user.workday_id}
              onChange={handleChange}
              className="outline-none mt-2 block w-full rounded-md border px-1 py-1.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-40 sm:text-sm sm:leading-6"
            >
              <option value="">Seleccione una jornada</option>
              {workday?.map(({ id, workday }) => (
                <option key={id} value={id}>
                  {workday}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">


        <button
          type="submit"
          disabled={!canSubmit}
          className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
            ${canSubmit
              ? 'bg-[#CDEA80] text-[#303031] hover:bg-[#BDDEFF] hover:text-black'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          Guardar
        </button>

      </div>

    </form>
  )
}
