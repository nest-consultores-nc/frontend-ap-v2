import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserPlusIcon,
  SquaresPlusIcon,
  EyeIcon,
  UserIcon,
  TrashIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ArrowDownOnSquareIcon,
  ArrowUpOnSquareIcon,
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  //PencilSquareIcon,
} from '@heroicons/react/24/outline'

import { Edit} from 'lucide-react'


export const ADMIN_LINKS_GROUPED = [
  {
    title: 'Inicio',
    links: [
      { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
    ],
  },
  {
    title: 'Gestión de Proyectos',
    links: [
      { name: 'Crear Proyecto', href: '/dashboard/crear-proyecto', icon: SquaresPlusIcon },
      { name: 'Proyectos', href: '/dashboard/proyectos', icon: DocumentDuplicateIcon },
      { name: 'Terminar Proyecto', href: '/dashboard/terminar-proyecto', icon: TrashIcon },
      { name: 'Agregar Dedicación', href: '/dashboard/agregar-horas', icon: DocumentPlusIcon },
      { name: 'Monitoreo', href: '/dashboard/monitoreo', icon: EyeIcon },
    ],
  },
  {
    title: 'Usuarios y Clientes',
    links: [
      { name: 'Crear Cliente', href: '/dashboard/crear-cliente', icon: UserPlusIcon },
      { name: 'Crear Usuario', href: '/dashboard/crear-usuario', icon: UserPlusIcon },
    ],
  },
  {
    title: 'Finanzas',
    links: [
      { name: 'Registrar Desembolsos', href: '/dashboard/registrar-desembolsos', icon: ArrowUpOnSquareIcon },
      { name: 'Registrar Ingresos', href: '/dashboard/registrar-ingresos', icon: ArrowUpOnSquareIcon },
      { name: 'Registrar Sueldos', href: '/dashboard/registrar-sueldos', icon: ArrowUpOnSquareIcon },
      { name: 'Costeo', href: '/dashboard/costeo', icon: CurrencyDollarIcon },
    ],
  },
  {
    title: 'Extras',
    links: [
      { name: 'Añadir Día Libre', href: '/dashboard/dia-libre', icon: CalendarDaysIcon },
      { name: 'Editar mi Perfil', href: '/dashboard/editar-perfil', icon: UserIcon },
      { name: 'Editar Registros', href: '/dashboard/editar', icon: Edit },
      { name: 'Reporte Automatizado', href: '/dashboard/reporte', icon: DocumentIcon },
      { name: 'Mesa de ayuda', href: '/dashboard/soporte', icon: ChatBubbleLeftRightIcon},
    ],
  },
]


export const DIRECTORA_EJECUTIVA_GROUPED = [
  {
    title: 'Inicio',
    links: [
      { name: 'Indicadores', href: '/dashboard', icon: HomeIcon },
    ],
  },
  {
    title: 'Gestión de Proyectos',
    links: [
      { name: 'Crear Proyecto', href: '/dashboard/crear-proyecto', icon: SquaresPlusIcon },
      { name: 'Proyectos', href: '/dashboard/proyectos', icon: DocumentDuplicateIcon },
      { name: 'Terminar Proyecto', href: '/dashboard/terminar-proyecto', icon: TrashIcon },
      { name: 'Agregar Dedicación', href: '/dashboard/agregar-horas', icon: DocumentPlusIcon },
      { name: 'Monitoreo', href: '/dashboard/monitoreo', icon: EyeIcon },
    ],
  },
  {
    title: 'Usuarios y Clientes',
    links: [
      { name: 'Crear Cliente', href: '/dashboard/crear-cliente', icon: UserPlusIcon },
      { name: 'Crear Usuario', href: '/dashboard/crear-usuario', icon: UserPlusIcon },
    ],
  },
  {
    title: 'Finanzas',
    links: [
      { name: 'Registrar Desembolsos', href: '/dashboard/registrar-desembolsos', icon: ArrowUpOnSquareIcon },
      { name: 'Registrar Ingresos', href: '/dashboard/registrar-ingresos', icon: ArrowDownOnSquareIcon },
      { name: 'Registrar Sueldos', href: '/dashboard/registrar-sueldos', icon: CurrencyDollarIcon },
      { name: 'Costeo', href: '/dashboard/costeo', icon: CurrencyDollarIcon },
    ],
  },
  {
    title: 'Extras',
    links: [
      { name: 'Añadir Día Libre', href: '/dashboard/dia-libre', icon: CalendarDaysIcon },
      { name: 'Editar mi Perfil', href: '/dashboard/editar-perfil', icon: UserIcon },
      { name: 'Editar Registros', href: '/dashboard/editar', icon: Edit },
      { name: 'Reporte Automatizado', href: '/dashboard/reporte', icon: DocumentIcon },
      { name: 'Mesa de ayuda', href: '/dashboard/soporte', icon: ChatBubbleLeftRightIcon},
    ],
  },
]


export const USUARIOS_GROUPED = [
  {
    title: 'Gestión de Proyectos',
    links: [
      { name: 'Proyectos', href: '/dashboard/proyectos', icon: DocumentDuplicateIcon },
      { name: 'Agregar Dedicación', href: '/dashboard/agregar-horas', icon: DocumentPlusIcon },
    ],
  },
  {
    title: 'Extras',
    links: [
      { name: 'Editar mi Perfil', href: '/dashboard/editar-perfil', icon: UserIcon },
      { name: 'Mesa de ayuda', href: '/dashboard/soporte', icon: ChatBubbleLeftRightIcon},
    ],
  },
]

