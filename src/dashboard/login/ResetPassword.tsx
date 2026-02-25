import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { queryLogin } from '../../api/auth'
import LogoAgenciaPolux from '../../assets/logo-polux-sin-fondo.png'

const COMMON = new Set([
  '123456','12345678','123456789','qwerty','password','111111','abc123','123123','000000',
])

function isStrongPassword(pw: string) {
  if (typeof pw !== 'string') return false
  if (pw.length < 8 || pw.length > 64) return false
  if (/\s/.test(pw)) return false
  if (COMMON.has(pw.toLowerCase())) return false
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  return hasLower && hasUpper && hasDigit && hasSymbol
}

export default function ResetPassword() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const rules = useMemo(() => {
    const lenOK = password.length >= 8 && password.length <= 64
    const noSpace = password.length > 0 && !/\s/.test(password)
    const notCommon = password.length > 0 && !COMMON.has(password.toLowerCase())
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    const matchOK = password.length > 0 && password === confirm
    return { lenOK, noSpace, notCommon, hasLower, hasUpper, hasDigit, hasSymbol, matchOK }
  }, [password, confirm])

  const strength = useMemo(() => {
    const base = [
      rules.lenOK, rules.noSpace, rules.notCommon,
      rules.hasLower, rules.hasUpper, rules.hasDigit, rules.hasSymbol
    ].filter(Boolean).length
    const pct = Math.round((base / 7) * 100)
    const label = pct >= 85 ? 'Fuerte' : pct >= 60 ? 'Media' : pct >= 35 ? 'Básica' : 'Débil'
    return { pct, label }
  }, [rules])

  const isFormOK = !!token && isStrongPassword(password) && rules.matchOK && !loading

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)

    if (!token) return setMsg({ type: 'error', text: 'Link inválido.' })
    if (!isStrongPassword(password))
      return setMsg({ type: 'error', text: 'La contraseña no cumple las políticas.' })
    if (!rules.matchOK) return setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })

    setLoading(true)
    try {
      const r = await queryLogin('reestablecer-password', '', 'POST', {
        token,
        newPassword: password,
      })
      if (!r.success) throw new Error(r.msg)
      setMsg({ type: 'ok', text: r.msg || 'Contraseña actualizada correctamente.' })
      setTimeout(() => navigate('/iniciar-sesion'), 1200)
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'No se pudo actualizar la contraseña.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="white shadow-sm rounded-2xl p-6 sm:p-8">
          <img src={LogoAgenciaPolux} alt="Agencia Pólux" className="mx-auto h-14 w-auto mb-4" />

          <h1 className="text-xl font-semibold text-gray-900 text-center">Restablecer contraseña</h1>
          <p className="mt-1 text-sm text-gray-500 text-center">Crea una nueva contraseña para tu cuenta.</p>

          {msg && (
            <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              msg.type === 'ok'
                ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
            }`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <div className="mt-1 relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="block w-full rounded-md border-2 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </button>
              </div>

              <div className="mt-3">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      strength.pct >= 85 ? 'bg-green-500'
                      : strength.pct >= 60 ? 'bg-yellow-500'
                      : strength.pct >= 35 ? 'bg-orange-500'
                      : 'bg-red-500'
                    }`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Fuerza: {strength.label}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <div className="mt-1 relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="block w-full rounded-md border-2 px-3 py-2 pr-10 text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-700">Políticas de contraseña</p>
              <ul className="mt-2 space-y-1 text-sm">
                <PolicyItem ok={rules.lenOK} text="Entre 8 y 64 caracteres" />
                <PolicyItem ok={rules.noSpace} text="Sin espacios en blanco" />
                <PolicyItem ok={rules.hasLower} text="Al menos una minúscula (a–z)" />
                <PolicyItem ok={rules.hasUpper} text="Al menos una mayúscula (A–Z)" />
                <PolicyItem ok={rules.hasDigit} text="Al menos un número (0–9)" />
                <PolicyItem ok={rules.hasSymbol} text="Al menos un símbolo (!@#$…)" />
                <PolicyItem ok={rules.matchOK} text="Coincide con la confirmación" />
              </ul>
            </div>

            <button
              type="submit"
              disabled={!isFormOK}
              className={`flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm
                ${!isFormOK
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-[#303031] hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'}
              `}
            >
              {loading ? (
                <>
                  Guardando
                  <svg className="ml-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </>
              ) : 'Guardar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/iniciar-sesion" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">© {new Date().getFullYear()} Agencia Pólux</p>
      </div>
    </div>
  )
}

function PolicyItem({ ok, text }: { ok: boolean, text: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? 'text-green-700' : 'text-gray-600'}`}>
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ring-1 ${
        ok ? 'bg-green-500 ring-green-500 text-[#303031]' : 'bg-gray-200 ring-gray-300 text-gray-500'
      }`}>
        {ok ? (
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 10l3 3 7-7" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        )}
      </span>
      <span>{text}</span>
    </li>
  )
}
