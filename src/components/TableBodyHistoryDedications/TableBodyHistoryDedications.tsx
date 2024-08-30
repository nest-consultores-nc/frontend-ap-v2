import { useEffect, useRef } from 'react'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'
import { TableRowHistoryDedication } from '../TableRowHistoryDedications/TableRowHistoryDedications'

interface TableProps {
  month: string
  data: IDedicationsByUserId[]
  isExpanded: boolean
  toggleExpand: (month: string) => void
}

export const TableBodyHistoryDedications: React.FC<TableProps> = ({
  month,
  data,
  isExpanded,
  toggleExpand,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isExpanded
        ? `${contentRef.current.scrollHeight}px`
        : '0px'
    }
  }, [isExpanded])

  return (
    <div className="border relative sm:rounded-lg my-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleExpand(month)}
      >
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
          {month}
        </p>
        <p className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"></p>
      </div>

      <div
        ref={contentRef}
        className="max-h-0 overflow-hidden duration-500 ease-in-out"
      >
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 mt-4">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Nombre Proyecto
              </th>
              <th scope="col" className="px-6 py-3">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3">
                Dedicación
              </th>
              <th scope="col" className="px-6 py-3">
                Semana
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <TableRowHistoryDedication
                key={index}
                projectName={row.project_name}
                client={row.client_name}
                dedication={`${row.dedicated}%`}
                week={row.week}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
