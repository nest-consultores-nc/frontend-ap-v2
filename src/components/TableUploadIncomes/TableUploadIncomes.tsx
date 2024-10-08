import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'
import { useState, useMemo } from 'react'

interface IIncomes {
  detail: string
  amount: string
  uf: string
  date: string
  project_id: number
  temporalities_name: string
  month: string
}

interface Props {
  projectsIncome: IIncomes[]
}

type SortKeys = keyof IIncomes
type SortOrder = 'asc' | 'desc'

function getSortValue(income: IIncomes, key: SortKeys): string | number {
  if (key === 'date') {
    return new Date(income[key]).getTime()
  }
  if (key === 'project_id') {
    return income[key]
  }
  return income[key].toString().toLowerCase()
}

export function TableUploadIncomes({ projectsIncome }: Props) {
  const [sortKey, setSortKey] = useState<SortKeys>('detail')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sortedIncomes = useMemo(() => {
    const sortedData = [...projectsIncome].sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sortedData
  }, [projectsIncome, sortKey, sortOrder])

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
    <div className="overflow-x-auto">
      <table className="text-sm text-left text-gray-500 w-full">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('detail')}
            >
              Detalle <SortIcon columnKey="detail" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('amount')}
            >
              Ingresos <SortIcon columnKey="amount" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('uf')}
            >
              UF <SortIcon columnKey="uf" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('date')}
            >
              Fecha <SortIcon columnKey="date" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('project_id')}
            >
              ID Proyecto <SortIcon columnKey="project_id" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('temporalities_name')}
            >
              Temporalidades  <SortIcon columnKey="temporalities_name" />
            </th>
            <th
              scope="col"
              className="px-6 py-3 w-1/6 cursor-pointer"
              onClick={() => handleSort('month')}
            >
              Mes <SortIcon columnKey="month" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedIncomes.map((income, index) => (
            <tr key={index} className="bg-white border-b">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                {income.detail}
              </th>
              <td className="px-6 py-4">{income.amount || '1328571'}</td>
              <td className="px-6 py-4">{income.uf || '0.00'}</td>
              <td className="px-6 py-4">{income.date.toString()}</td>
              <td className="px-6 py-4">{income.project_id}</td>
              <td className="px-6 py-4">{income.temporalities_name || '2'}</td>
              <td className="px-6 py-4">
                {income.month
                  ? income.month
                  : new Date(income.date).toLocaleString('default', {
                      month: 'short',
                    }) +
                    '-' +
                    new Date(income.date).getFullYear().toString().slice(-2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
