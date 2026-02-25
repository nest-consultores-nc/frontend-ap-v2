import { useState } from 'react'
import NavLinks from './NavLinks'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export function SideNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      
      <button
        className="block md:hidden p-2 absolute top-4 left-4 z-40 white rounded shadow"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

     
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}


      <nav
        className={`
          fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform
          transition-transform duration-200 ease-in-out
          w-64
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:shadow-none md:w-56
        `}
      >
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          <div className="flex grow flex-col space-y-2">
            <NavLinks />
            <form>
              <button
                type="button"
                className="flex w-full items-center justify-center md:justify-start gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-ap-secondary-light-color hover:text-red-600 transition"
                onClick={() => {
                 
                  window.location.href = '/iniciar-sesion'
                }}
              >
                <span className="hidden md:inline">Cerrar Sesión</span>
                <span className="md:hidden">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  )
}
