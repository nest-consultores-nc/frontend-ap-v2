import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserPlusIcon,
  SquaresPlusIcon,
  EyeIcon,
  UserIcon,
  TrashIcon,
  // CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline'
type LinkItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const ADMIN_LINKS: LinkItem[] = [
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
    icon: TrashIcon,
  },
  {
    name: 'Agregar Dedicación',
    href: '/dashboard/agregar-horas',
    icon: DocumentPlusIcon,
  },
  { name: 'Monitoreo', href: '/dashboard/monitoreo', icon: EyeIcon },
  {
    name: 'Crear Usuario',
    href: '/dashboard/crear-usuario',
    icon: UserPlusIcon,
  },
  {
    name: 'Registrar Desembolsos',
    href: '/dashboard/registrar-desembolsos',
    icon: ArrowUpOnSquareIcon,
  },
  {
    name: 'Registrar Ingresos',
    href: '/dashboard/registrar-ingresos',
    icon: ArrowDownOnSquareIcon,
  },
  {
    name: 'Registrar Sueldos',
    href: '/dashboard/registrar-sueldos',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Costeo',
    href: '/dashboard/costeo',
    icon: CurrencyDollarIcon,
  },
  // {
  //   name: 'Añadir Día Libre',
  //   href: '/dashboard/dia-libre',
  //   icon: CalendarDaysIcon,
  // },
  {
    name: 'Editar mi Perfil',
    href: '/dashboard/editar-perfil',
    icon: UserIcon,
  },
]

export const DIRECTORA_EJECUTIVA: LinkItem[] = [
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
    icon: TrashIcon,
  },
  {
    name: 'Agregar Dedicación',
    href: '/dashboard/agregar-horas',
    icon: DocumentPlusIcon,
  },
  { name: 'Monitoreo', href: '/dashboard/monitoreo', icon: EyeIcon },
  {
    name: 'Crear Usuario',
    href: '/dashboard/crear-usuario',
    icon: UserPlusIcon,
  },
  // {
  //   name: 'Añadir Día Libre',
  //   href: '/dashboard/dia-libre',
  //   icon: CalendarDaysIcon,
  // },
  {
    name: 'Editar mi Perfil',
    href: '/dashboard/editar-perfil',
    icon: UserIcon,
  },
]

export const USUARIOS: LinkItem[] = [
  {
    name: 'Proyectos',
    href: '/dashboard/proyectos',
    icon: DocumentDuplicateIcon,
  },
  {
    name: 'Agregar Dedicación',
    href: '/dashboard/agregar-horas',
    icon: DocumentPlusIcon,
  },
  {
    name: 'Editar mi Perfil',
    href: '/dashboard/editar-perfil',
    icon: UserIcon,
  },
]
