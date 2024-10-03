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
      <table className="text-sm text-left text-gray-500 w-full">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_name')}
            >
              Nombre del Proyecto <SortIcon columnKey="project_name" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('clientName')}
            >
              Nombre del Cliente <SortIcon columnKey="clientName" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('categoryName')}
            >
              Categoría del Proyecto <SortIcon columnKey="categoryName" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('typeName')}
            >
              Tipo de Proyecto <SortIcon columnKey="typeName" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_status')}
            >
              Estado del Proyecto <SortIcon columnKey="project_status" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              Fecha de Creación <SortIcon columnKey="createdAt" />
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
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_name}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {client?.clientName || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {category?.categoryName || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {type?.typeName || 'N/A'}
                </td>
                <td
                  className={`${getStatusClass(
                    project_status
                  )} px-6 py-4 font-medium whitespace-nowrap`}
                >
                  {project_status || 'N/A'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {formatDateTime(createdAt)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
