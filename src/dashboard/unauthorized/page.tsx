import { Link } from 'react-router-dom'
import ImageUnauthorized from '../../assets/401.png'
export function UnauthorizedPage() {
  return (
    <section className="bg-white ">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <img className="mx-auto" src={ImageUnauthorized} alt="401" />
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl ">
            Tus credenciales han expirado
          </p>
          <p className="mb-4 text-lg font-light text-gray-500 ">
            Por favor, inicia sesión nuevamente.
          </p>
          <Link
            to="/iniciar-sesion"
            className="rounded-md mt-2 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </section>
  )
}
