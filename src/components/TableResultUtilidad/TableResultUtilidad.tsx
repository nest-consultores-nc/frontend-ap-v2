import { useState, useMemo } from 'react'
import { PaginationProjectsTable } from '../PaginationProjectsTable/PaginationProjectsTable'
import { Datum } from '../../interfaces/costeo/utilidad.interface'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

type SortKeys = keyof Datum
type SortOrder = 'asc' | 'desc'

function getSortValue(item: Datum, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(item[key]).getTime()
  }
  return item[key]
}

export function TableResultUtilidad({ data }: { data: Datum[] }) {
  console.log("Example Datum:", data[0]);
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKeys>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const projectsPerPage = 20

  const sortedData = useMemo(() => {
    console.log("Unsorted data:", data);
    return [...data].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0;
    });
    
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
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon columnKey="date" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_client')}
            >
              Cliente Proyecto <SortIcon columnKey="project_client" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('amount')}
            >
              Ingresos (MM$) <SortIcon columnKey="amount" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('project_cost')}
            >
              Costo Proyecto (MM$) <SortIcon columnKey="project_cost" />
            </th>
            <th
              className="px-6 py-3 cursor-pointer"
              onClick={() => handleSort('utilidad')}
            >
              Utilidad (MM$) <SortIcon columnKey="utilidad" />
            </th>
          </tr>
        </thead>
        <tbody>
        {currentData.map(({ date, project_client, amount, project_cost, utilidad }, index) => {
        console.log("Project Client:", project_client); // Add this line for debugging
        return (
        <tr key={index} className="bg-white border-b">
          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {date}
        </td>
        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {project_client || 'N/A'} {/* Display 'N/A' if empty */}
        </td>
          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {(amount / 100).toFixed(2)}
        </td>
          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {(project_cost / 100).toFixed(2)}
        </td>
          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {(utilidad / 100).toFixed(2)}
        </td>
      </tr>
    );
    })}

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
