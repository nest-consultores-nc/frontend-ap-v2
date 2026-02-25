import { useState, useMemo } from 'react'
import { ITableDedications } from '../../interfaces/dedications/dedications.interfaces'
import { TableBodyHistoryDedications } from '../TableBodyHistoryDedications/TableBodyHistoryDedications'

function parseFecha(fecha: string | Date): Date {
  if (fecha instanceof Date) return fecha


  if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    const d = new Date(fecha)
    if (!isNaN(d.getTime())) return d
  }

  let m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha)
  if (m) {
    const [, dd, mm, yyyy] = m
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    if (!isNaN(d.getTime())) return d
  }

  m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(fecha)
  if (m) {
    const [, dd, mm, yyyy] = m
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    if (!isNaN(d.getTime())) return d
  }


  const fallback = new Date(fecha)
  if (!isNaN(fallback.getTime())) return fallback

  return new Date(NaN)
}

export function TableHistoryDedications({
  historyDedications,
}: {
  historyDedications: ITableDedications[]
}) {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({})

  const groupedByYear = useMemo(() => {
    const acc: Record<string, ITableDedications[]> = {}

    for (const dedication of historyDedications) {
      const firstWeek = dedication.dedications?.[0]?.week
      const baseDate = firstWeek ? parseFecha(firstWeek) : parseFecha(dedication.fecha)
      if (isNaN(baseDate.getTime())) continue

      const year = String(baseDate.getFullYear())  
      if (!acc[year]) acc[year] = []
      acc[year].push(dedication)
    }

    return Object.entries(acc).sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [historyDedications])

  const toggleExpandMonth = (monthKey: string) => {
    setExpandedTables(prev => ({ ...prev, [monthKey]: !prev[monthKey] }))
  }

  const toggleExpandYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))
  }


  const fmtMonth = useMemo(
    () => new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }),
    []
  )

  return (
    <div className="mt-6">
      {groupedByYear.map(([year, dedications]) => {
        
        const sortedByMonthDesc = [...dedications].sort((a, b) => {
          const aw = a.dedications?.[0]?.week
          const bw = b.dedications?.[0]?.week
          const da = (aw ? parseFecha(aw) : parseFecha(a.fecha)).getTime()
          const db = (bw ? parseFecha(bw) : parseFecha(b.fecha)).getTime()
          return db - da
        })

        return (
          <div key={year} className="mb-6 border rounded-md shadow">
          
            <button
              onClick={() => toggleExpandYear(year)}
              className="w-full text-left px-4 py-2 text-[#303031] bg-[#CDEA80] font-semibold"
            >
              {expandedYears[year] ? '▼' : ''} {year}
            </button>

       
            {expandedYears[year] && (
              <div className="pl-4 pr-4">
                {sortedByMonthDesc.map((dedication) => {
                    const firstWeek = dedication.dedications?.[0]?.week
                    const baseDate = firstWeek ? parseFecha(firstWeek) : parseFecha(dedication.fecha)

                    const monthLabel = fmtMonth.format(baseDate).toUpperCase()
                    const monthId = `${baseDate.getFullYear()}-${baseDate.getMonth()}`

                  return (
                    <TableBodyHistoryDedications
                      key={monthId}
                      month={monthLabel}
                      year={baseDate.getFullYear()}
                      data={dedication.dedications}
                      isExpanded={!!expandedTables[monthId]}
                      toggleExpand={(_ignored) => toggleExpandMonth(monthId)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
