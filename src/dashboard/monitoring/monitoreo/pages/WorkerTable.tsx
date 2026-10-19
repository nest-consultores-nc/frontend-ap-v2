import { Estado } from '../model'
import { EstadoChip } from '../EstadoChip'

export interface WorkerRow {
  id: number
  name: string
  value: number
  estado: Estado
}

interface Props {
  rows: WorkerRow[]
  valueLabel: string
  format: (v: number) => string
  /** trabajadores seleccionados con clic (se resaltan) */
  selected: number[]
  onSelect: (id: number, multi: boolean) => void
}

/** Tabla "Detalle por trabajador": cada fila es clicable para filtrar el resto */
export function WorkerTable({ rows, valueLabel, format, selected, onSelect }: Props) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-xs text-[#898781]">No hay trabajadores para los filtros elegidos</p>
  }
  const sel = new Set(selected)
  return (
    <div className="overflow-auto max-h-[460px] -mx-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-[#e1e0d9] text-xs text-[#52514e]">
            <th className="py-2 px-2 text-left font-medium">Trabajador</th>
            <th className="py-2 px-2 text-right font-medium">{valueLabel}</th>
            <th className="py-2 px-2 text-left font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const active = sel.has(r.id)
            const dim = sel.size > 0 && !active
            return (
              <tr
                key={r.id}
                tabIndex={0}
                aria-selected={active}
                onClick={(e) => onSelect(r.id, e.ctrlKey || e.metaKey)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(r.id, e.ctrlKey || e.metaKey)
                  }
                }}
                className={`cursor-pointer border-b border-[#e1e0d9]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#CDEA80] ${
                  active ? 'bg-[#CDEA80]/40' : i % 2 ? 'bg-[#EDEBE5]/40 hover:bg-black/5' : 'hover:bg-black/5'
                } ${dim ? 'opacity-50' : ''}`}
              >
                <td className="py-2 px-2 text-[#0b0b0b]">{r.name}</td>
                <td className="py-2 px-2 text-right tabular-nums text-[#0b0b0b]">{format(r.value)}</td>
                <td className="py-2 px-2">
                  <EstadoChip estado={r.estado} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
