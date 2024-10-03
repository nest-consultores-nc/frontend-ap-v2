import { useState } from 'react'
import { ITableDedications } from '../../interfaces/dedications/dedications.interfaces'
import { TableBodyHistoryDedications } from '../TableBodyHistoryDedications/TableBodyHistoryDedications'

export function TableHistoryDedications({
  historyDedications,
}: {
  historyDedications: ITableDedications[]
}) {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    {}
  )

  const toggleExpand = (month: string) => {
    setExpandedTables((prevState) => ({
      ...prevState,
      [month]: !prevState[month],
    }))
  }

  const getMonthName = (fecha: string): string =>
    new Date(fecha)
      .toLocaleString('es-ES', { month: 'long', year: 'numeric' })
      .toUpperCase()

  return (
    <>
      {historyDedications.map((dedication) => {
        const monthName = new Date(dedication.fecha)
          .toLocaleString('es-ES', {
            month: 'long',
            year: 'numeric',
          })
          .toUpperCase()

        return (
          <TableBodyHistoryDedications
            key={dedication.fecha}
            month={monthName}
            data={dedication.dedications}
            isExpanded={expandedTables[getMonthName(monthName)] || false}
            toggleExpand={toggleExpand}
          />
        )
      })}
    </>
  )
}
