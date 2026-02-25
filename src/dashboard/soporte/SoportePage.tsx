import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function SoportePage() {
  const btnBase =
    'inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg ' +
    'transition-all duration-200 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-[#BDDEFF]'

  const btnPrimary =
    'text-[#303031] bg-gradient-to-r from-[#CDEA80] to-[#BDDEFF] shadow-lg ' +
    'hover:shadow-xl hover:scale-[1.02]'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDEBE5] to-indigo-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CDEA80] to-[#BDDEFF] mb-4 shadow-lg">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-[#303031]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Mesa de Ayuda
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestro equipo de soporte técnico está disponible para ayudarte. Utiliza el sistema de tickets para reportar incidencias o solicitar asistencia.
          </p>
        </div>


        <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-gray-900/10 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Tickets</h2>
            <p className="text-gray-600">
              Gestión y seguimiento de solicitudes de soporte técnico
            </p>
          </div>

          <div className="space-y-6">

            <div className="bg-[#EDEBE5] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                ¿Cómo funciona?
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CDEA80] text-[#303031] flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Describe tu problema o solicitud con detalle</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CDEA80] text-[#303031] flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>El equipo de TI recibirá tu ticket automáticamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CDEA80] text-[#303031] flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Recibirás actualizaciones sobre el progreso de tu solicitud por correo electrónico, también puedes darle seguimiento a tu historial desde el mismo portal</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="https://ticket.nestconsultores.cl/iniciar-sesion"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full justify-center ${btnBase} ${btnPrimary}`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Acceder al Sistema de Tickets
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#EDEBE5] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <p className="text-sm text-gray-600">Disponibilidad del sistema</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#EDEBE5] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">&lt; 48h</div>
                <p className="text-sm text-gray-600">Tiempo de respuesta promedio</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EDEBE5] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Seguimiento en Tiempo Real</h3>
            <p className="text-gray-600 text-sm">Monitorea el estado de tus tickets en cualquier momento</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EDEBE5] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Notificaciones por Email</h3>
            <p className="text-gray-600 text-sm">Recibe actualizaciones automáticas sobre tus solicitudes</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#EDEBE5] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#303031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Equipo Especializado</h3>
            <p className="text-gray-600 text-sm">Personal capacitado para resolver tus consultas</p>
          </div>
        </div>
      </div>
    </div>
  )
}