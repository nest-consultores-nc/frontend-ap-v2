import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserPlusIcon,
  SquaresPlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'

type LinkItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const links: LinkItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Crear Cliente',
    href: '/dashboard/crear-cliente',
    icon: UserPlusIcon,
  },
  {
    name: 'Crear Proyecto',
    href: '/dashboard/crear-proyecto',
    icon: SquaresPlusIcon,
  },
  {
    name: 'Proyectos',
    href: '/dashboard/proyectos',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Terminar Proyecto',
    href: '/dashboard/terminar-proyecto',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Agregar Dedicación',
    href: '/dashboard/agregar-horas',
    icon: HomeIcon,
  },
  { name: 'Monitoreo', href: '/dashboard/monitoreo', icon: EyeIcon },
  {
    name: 'Crear Usuario',
    href: '/dashboard/crear-usuario',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Registrar Desembolsos',
    href: '/dashboard/registrar-desembolsos',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Registrar Ingresos',
    href: '/dashboard/registrar-ingresos',
    icon: HomeIcon,
  },
  {
    name: 'Registrar Sueldos',
    href: '/dashboard/registrar-sueldos',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Añadir Día Libre',
    href: '/dashboard/dia-libre',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Editar mi Perfil',
    href: '/dashboard/editar-perfil',
    icon: DocumentDuplicateIcon,
  },
]

export default function NavLinks() {
  const { pathname } = useLocation()

  return (
    <>
      {links.map(({ name, href, icon: Icon }) => (
        <Link
          key={name}
          to={href}
          className={clsx(
            'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium bg-gray-50 hover:bg-ap-secondary-light-color hover:text-ap-secondary-color md:flex-none md:justify-start md:p-2 md:px-3 md:overflow-auto',
            {
              'bg-ap-secondary-color text-black': pathname === href,
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
