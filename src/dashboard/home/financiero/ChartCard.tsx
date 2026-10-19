import { ReactNode, useState } from 'react'

export interface TableView {
  columns: string[]
  rows: (string | number)[][]
  /** índices de columnas numéricas (se alinean a la derecha) */
  numeric?: number[]
}

export interface LegendItem {
  label: string
  color: string
  /** 'rect' para barras y áreas, 'line' para líneas */
  shape?: 'rect' | 'line'
}

interface Props {
  title: string
  legend?: LegendItem[]
  subtitle?: string
  table?: TableView
  className?: string
  children: ReactNode
}

/**
 * Tarjeta de un gráfico, con el botón "Tabla" para ver los mismos valores
 * sin depender del color ni del tooltip.
 */
export function ChartCard({ title, subtitle, legend, table, className = '', children }: Props) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section
      className={`bg-white rounded-xl ring-1 ring-black/10 p-4 flex flex-col min-w-0 ${className}`}
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#0b0b0b] truncate">{title}</h3>
          {subtitle && <p className="text-xs text-[#52514e] mt-0.5">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 text-xs font-medium text-[#52514e] hover:text-[#0b0b0b] px-2 py-1 rounded-md hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDEA80]"
            aria-pressed={showTable}
          >
            {showTable ? 'Gráfico' : 'Tabla'}
          </button>
        )}
      </header>

      {legend && !showTable && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-2" aria-label="Leyenda">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-xs text-[#52514e]">
              <span
                aria-hidden="true"
                className={l.shape === 'line' ? 'w-3 h-0.5 rounded-full' : 'w-2.5 h-2.5 rounded-sm'}
                style={{ background: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>
      )}

      {showTable && table ? <DataTable table={table} /> : children}
    </section>
  )
}

function DataTable({ table }: { table: TableView }) {
  const numeric = new Set(table.numeric ?? [])
  return (
    <div className="overflow-auto max-h-[420px] -mx-1">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-[#e1e0d9]">
            {table.columns.map((c, i) => (
              <th
                key={c}
                className={`py-2 px-2 font-medium text-[#52514e] ${numeric.has(i) ? 'text-right' : 'text-left'}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.length === 0 && (
            <tr>
              <td colSpan={table.columns.length} className="py-6 text-center text-[#898781]">
                Sin datos para los filtros seleccionados
              </td>
            </tr>
          )}
          {table.rows.map((row, r) => (
            <tr key={r} className="border-b border-[#e1e0d9]/60">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`py-1.5 px-2 text-[#0b0b0b] ${numeric.has(i) ? 'text-right tabular-nums' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Mensaje cuando un gráfico queda vacío por los filtros */
export function EmptyChart({ height }: { height: number }) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center text-xs text-[#898781]"
    >
      Sin datos para los filtros seleccionados
    </div>
  )
}
