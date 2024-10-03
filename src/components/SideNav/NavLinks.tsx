import { UserIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo-polux-sin-fondo.png'
import { ADMIN_LINKS, DIRECTORA_EJECUTIVA, USUARIOS } from '../../utils/routes'

type LinkItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function NavLinks() {
  const role = localStorage.getItem('role')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const getLinksByRole = (role: string | null): LinkItem[] => {
    switch (role) {
      case 'admin':
        return ADMIN_LINKS
      case 'directoraejecutiva':
        return DIRECTORA_EJECUTIVA
      case 'ejecutivo(a)decuentassenior':
      case 'ejecutivo(a)decuentas':
        return USUARIOS
      default:
        localStorage.clear()
        navigate('/unauthorized')
        return []
    }
  }

  const links = getLinksByRole(role)

  return (
    <>
      <img src={Logo} alt="logo" className="w-36 my-0 mx-auto" />
      <div className="bg-gray-200 p-5 flex justify-center">
        <UserIcon className="w-5 mr-2" />
        {localStorage.getItem('name')}
      </div>
      {links.map(({ name, href, icon: Icon }) => (
        <Link
          key={name}
          to={href}
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium bg-gray-50 hover:bg-ap-secondary-light-color hover:text-ap-secondary-color md:flex-none md:justify-start md:p-2 md:px-3 md:overflow-auto',
            {
              'bg-ap-secondary-color text-red': pathname === href,
              'text-blue-700': pathname === href,
            }
          )}
        >
          <Icon className="w-6" />
          <p className="hidden md:block">{name}</p>
        </Link>
      ))}
    </>
  )
}
