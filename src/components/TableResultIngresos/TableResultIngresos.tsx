import { useState, useMemo } from 'react'
import { formatDateToISO } from '../../functions/formatDateTime'
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable'
import { IDataIngresos } from '../../interfaces/costeo/ingresos.interface'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

type SortKeys = keyof IDataIngresos
type SortOrder = 'asc' | 'desc'

function getSortValue(item: IDataIngresos, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime()
  }
  if (typeof item[key] === 'number') {
    return item[key] as number
  }
  return (item[key] as string).toLowerCase()
}

export function TableResultIngresos({ data }: { data: IDataIngresos[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKeys>('project_id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const projectsPerPage = 10

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortOrder])

  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentData = sortedData.slice(indexOfFirstProject, indexOfLastProject)
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
              onClick={() => handleSort('project_id')}
            >
              Project ID <SortIcon columnKey="project_id" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('amount')}
            >
              Amount <SortIcon columnKey="amount" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Date <SortIcon columnKey="date" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('detail')}
            >
              Detail <SortIcon columnKey="detail" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('UF')}
            >
              UF <SortIcon columnKey="UF" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('temporalities_id')}
            >
              Temporalities ID <SortIcon columnKey="temporalities_id" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_client')}
            >
              Project Client <SortIcon columnKey="project_client" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('amount_p')}
            >
              Amount P <SortIcon columnKey="amount_p" />
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            (
              {
                project_id,
                amount,
                date,
                detail,
                UF,
                temporalities_id,
                project_client,
                amount_p,
              },
              index
            ) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_id}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {amount}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {date && formatDateToISO(date)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {detail}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {UF}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {temporalities_id}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_client}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {amount_p}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      <PaginationProjectsTable
        currentPage={currentPage}
        totalProjects={data.length}
        paginate={paginate}
        projectsPerPage={projectsPerPage}
      />
    </div>
  )
}
