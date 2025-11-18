import { UserIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo-polux-sin-fondo.png'
import {
  ADMIN_LINKS_GROUPED,
  DIRECTORA_EJECUTIVA_GROUPED,
  USUARIOS_GROUPED,
} from '../../utils/routes'
import { useEffect, useMemo, useState } from 'react'

type LinkItem = {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type GroupedLinks = {
  title: string
  links: LinkItem[]
}

export default function NavLinks() {
  const role = localStorage.getItem('role')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const getGroupsByRole = (role: string | null): GroupedLinks[] => {
    switch (role) {
      case 'admin':
        return ADMIN_LINKS_GROUPED
      case 'directoraejecutiva':
        return DIRECTORA_EJECUTIVA_GROUPED
      case 'ejecutivo(a)decuentassenior':
      case 'ejecutivo(a)decuentas':
      case 'director(a)decuentas':
        return USUARIOS_GROUPED
      default:
        navigate('/unauthorized')
        return []
    }
  }

  const groups = useMemo(() => getGroupsByRole(role), [role])
  const [openGroups, setOpenGroups] = useState<string[]>(groups.map(g => g.title))


  useEffect(() => {
    setOpenGroups(groups.map(g => g.title))
  }, [groups])

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev =>
      prev.includes(groupTitle) ? prev.filter(t => t !== groupTitle) : [...prev, groupTitle]
    )
  }

  return (
    <>
      <img src={Logo} alt="logo" className="w-40 my-0 mx-auto" />
        <div className="bg-gradient-to-r from-[#3E3378] to-[#89CCDC] p-5 flex justify-center text-white">
          <UserIcon className="w-5 mr-2" />
          {localStorage.getItem('name')}
        </div>


      {groups.map(({ title, links }) => (
        <div key={title} className="mb-4">
          <button
            onClick={() => toggleGroup(title)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            {title}
            {openGroups.includes(title) ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          <div className={`${openGroups.includes(title) ? 'block' : 'hidden'} transition-all`}>
            {links.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                to={href}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2 text-sm rounded-md transition hover:bg-[#3E3378] hover:text-[#EEEBE6]',
                  {
                    'bg-[#89CCDC] text-[#303031]': pathname === href,
                    'text-[#303031]': pathname !== href,
                  }
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
