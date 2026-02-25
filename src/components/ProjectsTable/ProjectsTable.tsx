import { useState, useMemo } from 'react'
import { formatDateTime } from '../../functions/formatDateTime'
import { IProject } from '../../interfaces/projects/projects.interface'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

type SortKeys = keyof IProject | 'clientName' | 'categoryName' | 'typeName'
type SortOrder = 'asc' | 'desc'

function getSortValue(project: IProject, key: SortKeys): string | number {
  switch (key) {
    case 'clientName':
      return project.client?.clientName || ''
    case 'categoryName':
      return project.category?.categoryName || ''
    case 'typeName':
      return project.type?.typeName || ''
    case 'createdAt':
      return new Date(project.createdAt).getTime()
    default:
      return project[key] as string
  }
}

export function ProjectsTable({ projects }: { projects: IProject[] }) {
  const [sortKey, setSortKey] = useState<SortKeys>('project_name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedProjects = useMemo(() => {
    const sortedData = [...projects].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sortedData
  }, [projects, sortKey, sortOrder])

  const getStatusClass = (status: string) => {
    return status === 'Vigente' ? 'text-green-600' : 'text-red-600'
  }

  const handleSort = (key: SortKeys) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: SortKeys }) => {
    if (columnKey !== sortKey) return null
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="inline w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="inline w-4 h-4 ml-1" />
    )
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full hidden sm:table table-auto text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('project_name')}>
              Nombre del Proyecto <SortIcon columnKey="project_name" />
            </th>
            <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('clientName')}>
              Cliente <SortIcon columnKey="clientName" />
            </th>
        
            <th className="px-3 py-2 cursor-pointer hidden lg:table-cell" onClick={() => handleSort('categoryName')}>
              Categoría <SortIcon columnKey="categoryName" />
            </th>
        
            <th className="px-3 py-2 cursor-pointer hidden xl:table-cell" onClick={() => handleSort('typeName')}>
              Tipo <SortIcon columnKey="typeName" />
            </th>
            <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('project_status')}>
              Estado <SortIcon columnKey="project_status" />
            </th>
       
            <th className="px-3 py-2 cursor-pointer hidden md:table-cell" onClick={() => handleSort('createdAt')}>
              Creación <SortIcon columnKey="createdAt" />
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedProjects.map(
            ({
              id,
              project_name,
              client,
              category,
              type,
              project_status,
              createdAt,
            }) => (
              <tr key={id} className="bg-white border-b">
                <td className="px-3 py-2 align-top [#303031]space-normal break-words">
                  {project_name}
                </td>

                <td className="px-3 py-2 align-top [#303031]space-normal break-words">
                  {client?.clientName || 'N/A'}
                </td>

                <td className="px-3 py-2 align-top [#303031]space-normal break-words hidden lg:table-cell">
                  {category?.categoryName || 'N/A'}
                </td>

                <td className="px-3 py-2 align-top [#303031]space-normal break-words hidden xl:table-cell">
                  {type?.typeName || 'N/A'}
                </td>

                <td className={`px-3 py-2 align-top ${getStatusClass(project_status)}`}>
                  <span className="[#303031]space-nowrap">{project_status || 'N/A'}</span>
                </td>

                <td className="px-3 py-2 align-top hidden md:table-cell">
                  <span className="[#303031]space-nowrap">{formatDateTime(createdAt)}</span>
                </td>

              </tr>
            )
          )}
        </tbody>
      </table>


      <div className="sm:hidden space-y-4 mt-2">
              {sortedProjects.map((project) => (
                <div key={project.id} className="white border rounded-xl shadow p-4">
                  <div className="mb-1">
                    <span className="font-semibold">Nombre del Proyecto: </span>
                    <span>{project.project_name}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Cliente: </span>
                    <span>{project.client?.clientName || 'N/A'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Categoría: </span>
                    <span>{project.category?.categoryName || 'N/A'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Tipo: </span>
                    <span>{project.type?.typeName || 'N/A'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Estado: </span>
                    <span className={getStatusClass(project.project_status)}>
                      {project.project_status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Creación: </span>
                    <span>{formatDateTime(project.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

  )
}
