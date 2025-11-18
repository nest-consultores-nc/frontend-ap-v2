import { useState } from 'react'
import { Link } from 'react-router-dom'
import { queryLogin } from '../../api/auth'
import LogoAgenciaPolux from '../../assets/logo-polux-sin-fondo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const isValid = /\S+@\S+\.\S+/.test(email)

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setMsg(null)
  if (!isValid) {
    setMsg({ type: 'error', text: 'Ingresa un correo válido.' })
    return
  }

  setLoading(true)
  try {
    const response = await queryLogin('recuperar-password', '', 'POST', { email })
    
    // 👇 AGREGA ESTOS LOGS
    console.log('📦 Respuesta completa:', response)
    console.log('📦 response.data:', response.data)
    console.log('📦 response.success:', response.success)
    
    const data = response.data as any
    console.log('🔗 resetUrl encontrado?:', data?.resetUrl) // 👈 IMPORTANTE
    
    if (data?.resetUrl) {
      setMsg({ type: 'ok', text: '¡Link generado! Abriendo...' })
      console.log('✅ Redirigiendo a:', data.resetUrl)
      setTimeout(() => {
        window.location.href = data.resetUrl
      }, 500)
    } else {
      console.log('⚠️ No se encontró resetUrl en la respuesta')
      setMsg({ type: 'ok', text: 'Te enviaremos un enlace para restablecer tu contraseña.' })
    }
  } catch (error) {
    console.error('❌ Error:', error)
    setMsg({ type: 'ok', text: 'Te enviaremos un enlace para restablecer tu contraseña.' })
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8">
          {/* Logo */}
          <img
            src={LogoAgenciaPolux}
            alt="Agencia Pólux"
            className="mx-auto h-14 w-auto mb-4"
          />

          {/* Título y descripción */}
          <h1 className="text-xl font-semibold text-gray-900 text-center">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-1 text-sm text-gray-500 text-center">
            Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>

          {/* Mensajes */}
          {msg && (
            <div
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                msg.type === 'ok'
                  ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@agenciapolux.cl"
                autoComplete="email"
                className="mt-1 block w-full rounded-md border-2 px-3 py-2 text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {!email ? (
                <p className="mt-1 text-xs text-gray-400">Ej.: nombre@agenciapolux.cl</p>
              ) : !isValid ? (
                <p className="mt-1 text-xs text-red-500">Formato de correo no válido.</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm
                ${!isValid || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600'}
              `}
            >
              {loading ? (
                <>
                  Enviando
                  <svg
                    className="ml-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </>
              ) : (
                'Enviar enlace'
              )}
            </button>
          </form>

          {/* Acciones secundarias */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-xs text-gray-500">
              ¿Recordaste tu contraseña?
            </p>
            <Link
              to="/iniciar-sesion"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>

        {/* Pie con marca */}
        <p className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Agencia Pólux
        </p>
      </div>
    </div>
  )
}
