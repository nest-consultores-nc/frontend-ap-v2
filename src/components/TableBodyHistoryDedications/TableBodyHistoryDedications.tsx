import { useEffect, useRef } from 'react'
import { IDedicationsByUserId } from '../../interfaces/dedications/dedications.interfaces'
import { TableRowHistoryDedication } from '../TableRowHistoryDedications/TableRowHistoryDedications'

interface TableProps {
  month: string
  year: number
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
        {/* MOBILE: Cards (sm:hidden) */}
        <div className="sm:hidden px-4 pb-4 space-y-3 mt-4">
          {data.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
            >
              <div className="text-xs text-gray-500 mb-1">Semana</div>
              <div className="text-base font-semibold text-gray-900 mb-3">
                {row.week}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div className="text-xs text-gray-500">Proyecto</div>
                  <div className="text-sm text-gray-900">{row.project_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cliente</div>
                  <div className="text-sm text-gray-900">{row.client_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Dedicación</div>
                  <div className="text-sm text-gray-900">
                    {typeof row.dedicated === 'number'
                      ? `${row.dedicated}%`
                      : row.dedicated}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP: Tabla (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto mt-4">
          <table className="w-full min-w-[720px] text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre Proyecto</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Dedicación</th>
                <th scope="col" className="px-6 py-3">Semana</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <TableRowHistoryDedication
                  key={index}
                  projectName={row.project_name}
                  client={row.client_name}
                  dedication={
                    typeof row.dedicated === 'number'
                      ? `${row.dedicated}%`
                      : row.dedicated
                  }
                  week={row.week}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
