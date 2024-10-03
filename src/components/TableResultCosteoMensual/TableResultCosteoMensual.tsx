'use client'

import { useState, useMemo } from 'react'
import { formatDateTime } from '../../functions/formatDateTime'
import { ICosteoMensual } from '../../interfaces/costeo/costeo-mensual.interface'
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

type SortKeys = keyof ICosteoMensual
type SortOrder = 'asc' | 'desc'

function getSortValue(item: ICosteoMensual, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime()
  }
  if (typeof item[key] === 'number') {
    return item[key] as number
  }
  return (item[key] as string).toLowerCase()
}

export function TableResultCosteoMensual({ data }: { data: ICosteoMensual[] }) {
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
              onClick={() => handleSort('salarie_cost')}
            >
              Salarie Cost <SortIcon columnKey="salarie_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('direct_cost')}
            >
              Direct Cost <SortIcon columnKey="direct_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Date <SortIcon columnKey="date" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('indirect_cost')}
            >
              Indirect Cost <SortIcon columnKey="indirect_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_cost')}
            >
              Project Cost <SortIcon columnKey="project_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_client')}
            >
              Project Client <SortIcon columnKey="project_client" />
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map(
            ({
              project_id,
              salarie_cost,
              direct_cost,
              date,
              indirect_cost,
              project_cost,
              project_client,
            }) => (
              <tr key={project_id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_id}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {salarie_cost}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {direct_cost}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {date && formatDateTime(date)}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {indirect_cost}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_cost}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project_client}
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
