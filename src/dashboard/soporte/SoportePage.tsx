import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function SoportePage() {
  const btnBase =
    'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl ' +
    'transition-[filter,box-shadow] duration-150 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-300'

  const btnGradient =
    'text-white bg-gradient-to-r from-blue-600 to-indigo-600 ' +
    'hover:brightness-105 hover:shadow-md'

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mesa de Ayuda</h1>
        <p className="text-gray-600">
          ¿Necesitas ayuda? Serás redirigido a nuestro sistema de tickets para describir tu caso con mayor precisión.
          Esto ayudará al equipo de TI a gestionar y dar seguimiento de forma correcta.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Soporte y Contacto</h2>
            <p className="mt-1 text-sm text-gray-600">
              Haz clic en el botón para ir al sistema de tickets.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="https://ticket.nestconsultores.cl/iniciar-sesion"
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} ${btnGradient}`}
            title="Ir al sistema de tickets"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
            Ir al Sistema de Tickets
          </a>
        </div>
      </div>
    </div>
  )
}
